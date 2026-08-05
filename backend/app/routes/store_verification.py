from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_admin, require_owner
from app.models.store_verification import VerificationStatus
from app.models.user import User
from app.schemas.store_verification import (
    StoreVerificationAdminOut,
    StoreVerificationOut,
    StoreVerificationReview,
    StoreVerificationSubmit,
)
from app.services import store_verification_service

router = APIRouter(prefix="/api/store-verification", tags=["store-verification"])


@router.get("/mine", response_model=StoreVerificationOut)
def get_my_verification(db: Session = Depends(get_db), current_user: User = Depends(require_owner)):
    return store_verification_service.get_or_create(db, current_user.id)


@router.post("/submit", response_model=StoreVerificationOut)
def submit_verification(
    payload: StoreVerificationSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return store_verification_service.submit(db, current_user.id, payload)


@router.get("/pending", response_model=list[StoreVerificationAdminOut])
def list_verifications_for_review(
    status_filter: VerificationStatus = VerificationStatus.PENDING,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return store_verification_service.list_verifications(db, status_filter)


@router.post("/{verification_id}/review", response_model=StoreVerificationOut)
def review_verification(
    verification_id: int,
    payload: StoreVerificationReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return store_verification_service.review(db, verification_id, current_user.id, payload)