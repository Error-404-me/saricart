from decimal import Decimal

from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderStatus, ALLOWED_TRANSITIONS, RESTOCKING_STATUSES
from app.models.order_item import OrderItem
from app.models.product import Product, ProductUnit
from app.models.stock_history import StockChangeReason
from app.models.user import User
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services import stock_service
from app.services.unit_conversion import (
    validate_transaction_quantity,
    resolve_transaction,
    to_selling_unit_quantity,
    line_total,
)
from app.models.notification import NotificationType
from app.services import notification_service

_CUSTOMER_STATUS_MESSAGES = {
    OrderStatus.ACCEPTED: "Your order has been accepted and is being prepared.",
    OrderStatus.PREPARING: "Your order is being prepared.",
    OrderStatus.READY: "Your order is ready for pickup!",
    OrderStatus.COMPLETED: "Thanks for your order!",
    OrderStatus.CANCELLED: "Your order was cancelled.",
}


def _with_items(query):
    return query.options(joinedload(Order.items), joinedload(Order.review))


def _validate_and_price_items(
    db: Session, items: list[OrderItemCreate], owner_id: int
) -> tuple[list[dict], Decimal]:
    """Shared by online checkout and walk-in (scanner) sales: same store,
    same stock checks, same server-computed total either way. Returns
    (resolved_items, total); each resolved item carries everything needed
    to decrement stock and create its OrderItem row."""
    product_ids = [item.product_id for item in items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_by_id = {p.id: p for p in products}

    if len(products_by_id) != len(set(product_ids)):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="One or more products in this order no longer exist.",
        )

    for product in products_by_id.values():
        if product.owner_id != owner_id:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="All items in an order must come from the same store.",
            )

    resolved_items = []
    total = Decimal("0")
    for item in items:
        product = products_by_id[item.product_id]
        try:
            requested_unit = ProductUnit(item.unit)
        except ValueError:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Unrecognized unit '{item.unit}'.",
            )

        validate_transaction_quantity(requested_unit, item.quantity)
        unit_price, ratio_to_selling_unit = resolve_transaction(product, requested_unit)
        selling_unit_quantity = to_selling_unit_quantity(item.quantity, ratio_to_selling_unit)

        if selling_unit_quantity > product.stock:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} {product.unit.value} of '{product.name}' left in stock.",
            )

        total += line_total(unit_price, item.quantity)
        resolved_items.append({
            "product": product,
            "requested_unit": requested_unit,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "selling_unit_quantity": selling_unit_quantity,
        })

    return resolved_items, total


def _add_order_items(db: Session, order: Order, resolved_items: list[dict]) -> None:
    for resolved in resolved_items:
        product = resolved["product"]
        stock_service.record_stock_change(
            db, product, -resolved["selling_unit_quantity"], StockChangeReason.SALE
        )
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_image=product.image,
                product_unit=resolved["requested_unit"].value,
                quantity=resolved["quantity"],
                price=resolved["unit_price"],
                selling_unit_quantity=resolved["selling_unit_quantity"],
            )
        )


def create_order(db: Session, order_in: OrderCreate, customer: User) -> Order:
    resolved_items, total = _validate_and_price_items(db, order_in.items, order_in.owner_id)

    order = Order(customer_id=customer.id, owner_id=order_in.owner_id, total=total)
    db.add(order)
    db.flush()

    _add_order_items(db, order, resolved_items)

    owner = resolved_items[0]["product"].owner
    if owner:
        notification_service.create_notification(
            db,
            owner,
            NotificationType.ORDER_PLACED,
            title="New order received",
            body=f"{customer.username} placed an order for ₱{order.total:.2f} — {len(order_in.items)} item(s).",
            link="/owner/orders",
        )

    db.commit()
    db.refresh(order)
    return order


def create_walk_in_sale(db: Session, items: list[OrderItemCreate], owner: User) -> Order:
    """A sale rung up in person, created already completed since there's
    no pickup to wait for. Counts toward analytics revenue like any other
    completed order and still logs stock history with the usual SALE reason."""
    if not items:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail="Scan at least one item first."
        )

    resolved_items, total = _validate_and_price_items(db, items, owner.id)

    order = Order(
        customer_id=owner.id,
        owner_id=owner.id,
        total=total,
        status=OrderStatus.COMPLETED,
    )
    db.add(order)
    db.flush()

    _add_order_items(db, order, resolved_items)

    db.commit()
    db.refresh(order)
    return order


def list_orders_for_customer(db: Session, customer_id: int) -> list[Order]:
    return (
        _with_items(db.query(Order))
        .filter(Order.customer_id == customer_id)
        .order_by(Order.created_at.desc())
        .all()
    )


def list_orders_for_owner(
    db: Session, owner_id: int, status_filter: OrderStatus | None = None
) -> list[Order]:
    query = _with_items(db.query(Order)).filter(Order.owner_id == owner_id)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.order_by(Order.created_at.desc()).all()


def get_order(db: Session, order_id: int) -> Order:
    order = _with_items(db.query(Order)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


def require_order_access(order: Order, current_user: User) -> None:
    if current_user.id not in (order.customer_id, order.owner_id):
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this order.",
        )


def update_order_status(
    db: Session, order_id: int, new_status: OrderStatus, current_user: User
) -> Order:
    order = get_order(db, order_id)

    if order.owner_id != current_user.id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only the store that received this order can update its status.",
        )

    if new_status not in ALLOWED_TRANSITIONS.get(order.status, set()):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Can't move an order from '{order.status.value}' to '{new_status.value}'.",
        )

    if new_status in RESTOCKING_STATUSES:
        _restock(db, order)

    order.status = new_status

    if order.customer:
        notification_service.create_notification(
            db,
            order.customer,
            NotificationType.ORDER_STATUS_CHANGED,
            title=f"Order #{order.id} — {new_status.value.replace('_', ' ').title()}",
            body=_CUSTOMER_STATUS_MESSAGES.get(new_status, "Your order status was updated."),
            link="/orders",
        )

    db.commit()
    db.refresh(order)
    return order


def _restock(db: Session, order: Order) -> None:
    """Returns reserved quantities to the shelf when an order is
    cancelled. Uses the snapshotted selling-unit-equivalent quantity, not
    the raw transacted quantity — an item bought by the piece from a box
    must return a fraction of a box back to stock, not a raw piece count."""
    for item in order.items:
        if item.product_id is None:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        restock_amount = item.selling_unit_quantity
        if restock_amount is None:
            restock_amount = item.quantity  # legacy rows without a snapshot
        stock_service.record_stock_change(db, product, restock_amount, StockChangeReason.CANCELLED)