from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.store_verification import VerificationStatus


class StoreVerificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    status: VerificationStatus
    government_id_url: Optional[str] = None
    business_permit_url: Optional[str] = None
    barangay_clearance_url: Optional[str] = None
    bir_registration_url: Optional[str] = None
    rejection_reason: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None


class StoreVerificationSubmit(BaseModel):
    government_id_url: str
    business_permit_url: str
    barangay_clearance_url: str
    bir_registration_url: Optional[str] = None


class StoreVerificationReview(BaseModel):
    status: VerificationStatus
    rejection_reason: Optional[str] = None