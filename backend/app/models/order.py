import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Numeric, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Statuses an owner can move *to*, from a given current status.
# Used to reject illegal transitions (e.g. jumping straight from
# pending to completed, or reviving a cancelled order).
ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.ACCEPTED, OrderStatus.CANCELLED},
    OrderStatus.ACCEPTED: {OrderStatus.PREPARING, OrderStatus.CANCELLED},
    OrderStatus.PREPARING: {OrderStatus.READY, OrderStatus.CANCELLED},
    OrderStatus.READY: {OrderStatus.COMPLETED},
    OrderStatus.COMPLETED: set(),
    OrderStatus.CANCELLED: set(),
}

# Statuses that release reserved stock back to the shelf when reached.
RESTOCKING_STATUSES = {OrderStatus.CANCELLED}


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Not in the original schema doc, but required so an owner only ever
    # sees orders placed against their own store.
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total = Column(Numeric(10, 2), nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    customer = relationship("User", foreign_keys=[customer_id])
    owner = relationship("User", foreign_keys=[owner_id])
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )

    @property
    def customer_username(self) -> str | None:
        return self.customer.username if self.customer else None

    @property
    def owner_username(self) -> str | None:
        return self.owner.username if self.owner else None
