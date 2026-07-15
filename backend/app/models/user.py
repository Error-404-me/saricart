import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Enum

from app.database import Base


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    OWNER = "owner"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
