from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="rating_range"),
    )

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # One review per order — the order's completion is what proves the
    # customer actually bought something, and the unique constraint stops
    # someone from reviewing the same order twice.
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    customer = relationship("User")
    order = relationship("Order", back_populates="review")

    @property
    def customer_username(self) -> str | None:
        return self.customer.username if self.customer else None
