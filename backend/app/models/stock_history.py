import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey

from app.database import Base


class StockChangeReason(str, enum.Enum):
    ADJUSTMENT = "adjustment"  # owner manually added/removed stock
    SALE = "sale"  # decremented because a customer placed an order
    CANCELLED = "cancelled"  # returned to shelf because an order was cancelled


class StockHistory(Base):
    __tablename__ = "stock_history"

    id = Column(Integer, primary_key=True, index=True)

    # Nullable + a name snapshot, same pattern as OrderItem: history should
    # still read correctly even after the product itself is deleted.
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    product_name = Column(String(150), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    change = Column(Integer, nullable=False)  # signed: +10 restock, -2 sale
    reason = Column(Enum(StockChangeReason), nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
