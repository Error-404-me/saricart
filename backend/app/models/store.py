from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Boolean, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Store(Base):
    """One-to-one storefront profile for a user with role=owner.

    Not in the original schema doc — added so Community Store Discovery has
    something to search by location and display (name, hours, open status).
    """

    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Manual toggle rather than a full weekly schedule — matches the MVP
    # scope of the rest of the app. closes_at is optional and only used to
    # derive a "closing soon" hint when the store is open.
    is_open = Column(Boolean, default=True, nullable=False)
    closes_at = Column(Time, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User")

    @property
    def owner_username(self) -> str | None:
        return self.owner.username if self.owner else None
