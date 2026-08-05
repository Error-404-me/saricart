from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.audit_log import AuditAction
from app.models.store import Store
from app.models.store_verification import StoreVerification, VerificationStatus
from app.schemas.store_verification import StoreVerificationSubmit, StoreVerificationReview
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

def list_verifications(db: Session, status_filter: VerificationStatus | None = None) -> list[dict]:
    query = db.query(StoreVerification).options(joinedload(StoreVerification.owner))
    if status_filter:
        query = query.filter(StoreVerification.status == status_filter)
    records = query.order_by(StoreVerification.submitted_at.desc().nullslast()).all()

    owner_ids = [r.owner_id for r in records]
    store_names = (
        {s.owner_id: s.name for s in db.query(Store).filter(Store.owner_id.in_(owner_ids)).all()}
        if owner_ids
        else {}
    )

    return [
        {
            "id": r.id,
            "owner_id": r.owner_id,
            "owner_username": r.owner.username if r.owner else None,
            "store_name": store_names.get(r.owner_id),
            "status": r.status,
            "government_id_url": r.government_id_url,
            "business_permit_url": r.business_permit_url,
            "barangay_clearance_url": r.barangay_clearance_url,
            "bir_registration_url": r.bir_registration_url,
            "rejection_reason": r.rejection_reason,
            "submitted_at": r.submitted_at,
            "reviewed_at": r.reviewed_at,
        }
        for r in records
    ]


def review(
    db: Session, verification_id: int, reviewer_id: int, payload: StoreVerificationReview
) -> StoreVerification:
    record = db.query(StoreVerification).filter(StoreVerification.id == verification_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification record not found.")

    if payload.status not in (VerificationStatus.VERIFIED, VerificationStatus.REJECTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review status must be 'verified' or 'rejected'.",
        )
    if record.status != VerificationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending submissions can be reviewed.",
        )
    if payload.status == VerificationStatus.REJECTED and not payload.rejection_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A rejection reason is required.",
        )

    record.status = payload.status
    record.rejection_reason = (
        payload.rejection_reason if payload.status == VerificationStatus.REJECTED else None
    )
    record.reviewed_at = datetime.now(timezone.utc)
    record.reviewed_by = reviewer_id

    audit_service.log_action(
        db,
        AuditAction.STORE_VERIFICATION_REVIEWED,
        user_id=reviewer_id,
        entity_type="store_verification",
        entity_id=record.id,
        description=f"Store verification #{record.id} (owner {record.owner_id}) → {payload.status.value}",
    )
    db.commit()
    db.refresh(record)
    return record