import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class AuditAction(str, enum.Enum):
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    PRODUCT_DELETED = "product_deleted"
    STOCK_ADJUSTED = "stock_adjusted"
    PRICE_UPDATED = "price_updated"
    ORDER_STATUS_CHANGED = "order_status_changed"
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET = "password_reset"
    ACCOUNT_DELETED = "account_deleted"
    STORE_VERIFICATION_SUBMITTED = "store_verification_submitted"
    STORE_VERIFICATION_REVIEWED = "store_verification_reviewed"


class AuditLog(Base):
    """Append-only trail of security- and business-sensitive actions —
    never updated or deleted by the app itself."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(Enum(AuditAction), nullable=False, index=True)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User")

    @property
    def username(self) -> str | None:
        return self.user.username if self.user else None