from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.audit_log import AuditAction
from app.models.store_verification import StoreVerification, VerificationStatus
from app.schemas.store_verification import StoreVerificationSubmit
from app.services import audit_service


def get_or_create(db: Session, owner_id: int) -> StoreVerification:
    record = db.query(StoreVerification).filter(StoreVerification.owner_id == owner_id).first()
    if not record:
        record = StoreVerification(owner_id=owner_id)
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def submit(db: Session, owner_id: int, payload: StoreVerificationSubmit) -> StoreVerification:
    record = get_or_create(db, owner_id)
    record.government_id_url = payload.government_id_url
    record.business_permit_url = payload.business_permit_url
    record.barangay_clearance_url = payload.barangay_clearance_url
    record.bir_registration_url = payload.bir_registration_url
    record.status = VerificationStatus.PENDING
    record.submitted_at = datetime.now(timezone.utc)
    record.rejection_reason = None

    audit_service.log_action(
        db, AuditAction.STORE_VERIFICATION_SUBMITTED, user_id=owner_id, entity_type="store_verification"
    )
    db.commit()
    db.refresh(record)
    return record