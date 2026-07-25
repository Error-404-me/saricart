import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class NotificationType(str, enum.Enum):
    ORDER_PLACED = "order_placed"          # owner: a customer placed an order
    ORDER_STATUS_CHANGED = "order_status_changed"  # customer: their order moved forward
    LOW_STOCK = "low_stock"                # owner: a product just crossed the low-stock line


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(150), nullable=False)
    body = Column(Text, nullable=True)
    link = Column(String(255), nullable=True)  # frontend route to open on click

    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")