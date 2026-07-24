from datetime import datetime, timezone

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Favorite(Base):
    """A customer's saved store, for quick access without re-searching
    nearby stores every time."""

    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("customer_id", "store_id", name="uq_customer_store_favorite"),
    )

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    store = relationship("Store")