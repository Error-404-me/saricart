from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_history import StockHistory, StockChangeReason
from app.models.user import User
from app.models.notification import NotificationType
from app.services import notification_service
from decimal import Decimal

LOW_STOCK_THRESHOLD = 5


def record_stock_change(
    db: Session, product: Product, delta: Decimal, reason: StockChangeReason
) -> None:
    """Apply a stock delta to a product and log it. Does not commit —
    callers control the transaction (e.g. order creation logs several of
    these before committing once)."""
    if delta == 0:
        return

    previous_stock = product.stock
    new_stock = previous_stock + delta

    db.add(
        StockHistory(
            product_id=product.id,
            product_name=product.name,
            owner_id=product.owner_id,
            change=delta,
            reason=reason,
            previous_stock=previous_stock,
            new_stock=new_stock,
        )
    )
    product.stock = new_stock

    if delta < 0 and previous_stock > LOW_STOCK_THRESHOLD >= new_stock and product.owner:
        notification_service.create_notification(
            db,
            product.owner,
            NotificationType.LOW_STOCK,
            title=f"{product.name} is running low",
            body=f"Only {new_stock} left in stock.",
            link="/owner/inventory",
        )


def adjust_stock(db: Session, product_id: int, delta: Decimal, current_user: User) -> Product:
    from app.services.product_service import get_product, _require_ownership, _validate_stock_for_unit

    product = get_product(db, product_id)
    _require_ownership(product, current_user)

    if delta == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Enter a non-zero amount.")

    new_stock = product.stock + delta
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can't remove {abs(delta)} — only {product.stock} in stock.",
        )
    _validate_stock_for_unit(product.unit, new_stock, product.sub_unit)

    record_stock_change(db, product, delta, StockChangeReason.ADJUSTMENT)
    db.commit()
    db.refresh(product)
    return product

def list_stock_history(
    db: Session,
    owner_id: int,
    product_id: int | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[StockHistory]:
    query = db.query(StockHistory).filter(StockHistory.owner_id == owner_id)
    if product_id is not None:
        query = query.filter(StockHistory.product_id == product_id)
    return (
        query.order_by(StockHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_stock_history_entry(db: Session, owner_id: int, entry_id: int) -> None:
    """Removes an entry from the activity log only — it never rewinds the
    stock change it recorded, same principle as deleting a notification."""
    entry = (
        db.query(StockHistory)
        .filter(StockHistory.id == entry_id, StockHistory.owner_id == owner_id)
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity entry not found.",
        )
    db.delete(entry)
    db.commit()


def delete_stock_history_entries(db: Session, owner_id: int, ids: list[int]) -> int:
    deleted_count = (
        db.query(StockHistory)
        .filter(StockHistory.owner_id == owner_id, StockHistory.id.in_(ids))
        .delete(synchronize_session=False)
    )
    db.commit()
    return deleted_count