import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean

from app.database import Base


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    OWNER = "owner"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    notify_order_updates = Column(Boolean, default=True, nullable=False)
    notify_promotions = Column(Boolean, default=False, nullable=False)
    notify_low_stock = Column(Boolean, default=True, nullable=False)

    # --- Compliance / security additions ---
    email_verified = Column(Boolean, default=False, nullable=False)
    terms_accepted_at = Column(DateTime, nullable=True)
    privacy_accepted_at = Column(DateTime, nullable=True)

    # Soft delete: account deactivates immediately; a scheduled job (see
    # app/tasks/purge_deleted_accounts.py) hard-deletes it once purge_at
    # passes, per RA 10173's storage-limitation principle. Logging back in
    # before purge_at cancels the deletion.
    deleted_at = Column(DateTime, nullable=True)
    purge_at = Column(DateTime, nullable=True)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None