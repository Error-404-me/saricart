from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_history import StockHistory, StockChangeReason
from app.models.user import User


def record_stock_change(
    db: Session, product: Product, delta: int, reason: StockChangeReason
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


def adjust_stock(db: Session, product_id: int, delta: int, current_user: User) -> Product:
    from app.services.product_service import get_product, _require_ownership

    product = get_product(db, product_id)
    _require_ownership(product, current_user)

    if delta == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Enter a non-zero amount."
        )
    if product.stock + delta < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can't remove {abs(delta)} — only {product.stock} in stock.",
        )

    record_stock_change(db, product, delta, StockChangeReason.ADJUSTMENT)
    db.commit()
    db.refresh(product)
    return product


def list_stock_history(
    db: Session, owner_id: int, product_id: int | None = None, limit: int = 50
) -> list[StockHistory]:
    query = db.query(StockHistory).filter(StockHistory.owner_id == owner_id)
    if product_id is not None:
        query = query.filter(StockHistory.product_id == product_id)
    return query.order_by(StockHistory.created_at.desc()).limit(limit).all()
