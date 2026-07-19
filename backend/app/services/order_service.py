from decimal import Decimal

from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderStatus, ALLOWED_TRANSITIONS, RESTOCKING_STATUSES
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.stock_history import StockChangeReason
from app.models.user import User
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services import stock_service


def _with_items(query):
    return query.options(joinedload(Order.items), joinedload(Order.review))


def _validate_and_price_items(
    db: Session, items: list[OrderItemCreate], owner_id: int
) -> tuple[dict[int, Product], Decimal]:
    """Shared by online checkout and walk-in (scanner) sales: same store,
    same stock checks, same server-computed total either way."""
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

    for item in items:
        product = products_by_id[item.product_id]
        if item.quantity > product.stock:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} of '{product.name}' left in stock.",
            )

    total = sum(products_by_id[item.product_id].price * item.quantity for item in items)
    return products_by_id, total


def create_order(db: Session, order_in: OrderCreate, customer: User) -> Order:
    products_by_id, total = _validate_and_price_items(db, order_in.items, order_in.owner_id)

    order = Order(customer_id=customer.id, owner_id=order_in.owner_id, total=total)
    db.add(order)
    db.flush()  # assign order.id before creating its items

    for item in order_in.items:
        product = products_by_id[item.product_id]
        stock_service.record_stock_change(db, product, -item.quantity, StockChangeReason.SALE)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_image=product.image,
                quantity=item.quantity,
                price=product.price,
            )
        )

    db.commit()
    db.refresh(order)
    return order


def create_walk_in_sale(db: Session, items: list[OrderItemCreate], owner: User) -> Order:
    """A sale rung up in person (e.g. via the barcode scanner) rather than
    placed online by a customer account. Modeled as an Order where the
    store is both the seller and the "customer", created already completed
    since there's no pickup to wait for — the goods left the shelf right
    now. Counts toward analytics revenue the same as any other completed
    order, and still logs stock history with the usual SALE reason."""
    if not items:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST, detail="Scan at least one item first."
        )

    products_by_id, total = _validate_and_price_items(db, items, owner.id)

    order = Order(
        customer_id=owner.id,
        owner_id=owner.id,
        total=total,
        status=OrderStatus.COMPLETED,
    )
    db.add(order)
    db.flush()

    for item in items:
        product = products_by_id[item.product_id]
        stock_service.record_stock_change(db, product, -item.quantity, StockChangeReason.SALE)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_image=product.image,
                quantity=item.quantity,
                price=product.price,
            )
        )

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
    db.commit()
    db.refresh(order)
    return order


def _restock(db: Session, order: Order) -> None:
    """Return reserved quantities to the shelf when an order is cancelled."""
    for item in order.items:
        if item.product_id is None:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            stock_service.record_stock_change(
                db, product, item.quantity, StockChangeReason.CANCELLED
            )
