import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

TOKEN_TTL_HOURS = 24


def generate_token() -> str:
    return secrets.token_urlsafe(32)


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(64), unique=True, index=True, nullable=False, default=generate_token)
    expires_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS),
    )
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.expires_at.replace(tzinfo=timezone.utc)

    @property
    def is_used(self) -> bool:
        return self.used_at is not None