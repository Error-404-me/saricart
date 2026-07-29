import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Enum, ForeignKey

from app.database import Base


class StockChangeReason(str, enum.Enum):
    ADJUSTMENT = "adjustment"
    SALE = "sale"
    CANCELLED = "cancelled"


class StockHistory(Base):
    __tablename__ = "stock_history"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    product_name = Column(String(150), nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    change = Column(Numeric(12, 3), nullable=False)
    reason = Column(Enum(StockChangeReason), nullable=False)
    previous_stock = Column(Numeric(12, 3), nullable=False)
    new_stock = Column(Numeric(12, 3), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))