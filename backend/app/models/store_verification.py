import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class VerificationStatus(str, enum.Enum):
    UNSUBMITTED = "unsubmitted"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class StoreVerification(Base):
    """Store-owner KYC record. Document URLs are populated via the same
    storage_service used for product images, so wiring real file uploads
    in later requires no backend schema change."""

    __tablename__ = "store_verifications"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    status = Column(Enum(VerificationStatus), default=VerificationStatus.UNSUBMITTED, nullable=False)

    government_id_url = Column(String(255), nullable=True)
    business_permit_url = Column(String(255), nullable=True)
    barangay_clearance_url = Column(String(255), nullable=True)
    bir_registration_url = Column(String(255), nullable=True)  # optional

    rejection_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    submitted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", foreign_keys=[owner_id])