from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.order import Order, OrderStatus
from app.models.review import Review
from app.models.store import Store
from app.models.user import User


def get_store_rating(db: Session, store_id: int) -> tuple[float | None, int]:
    result = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.store_id == store_id)
        .one()
    )
    average, count = result
    return (round(float(average), 1) if average is not None else None, count or 0)


def create_review(db: Session, order_id: int, rating: int, comment: str | None, customer: User) -> Review:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    if order.customer_id != customer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review your own orders.",
        )

    if order.status != OrderStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review an order once it's completed.",
        )

    existing = db.query(Review).filter(Review.order_id == order_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You've already reviewed this order.",
        )

    store = db.query(Store).filter(Store.owner_id == order.owner_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="This store no longer exists."
        )

    review = Review(
        store_id=store.id,
        customer_id=customer.id,
        order_id=order_id,
        rating=rating,
        comment=comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def list_store_reviews(db: Session, store_id: int, limit: int = 20) -> list[Review]:
    return (
        db.query(Review)
        .options(joinedload(Review.customer))
        .filter(Review.store_id == store_id)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )
