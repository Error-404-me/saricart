from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_owner
from app.models.user import User
from app.schemas.store_verification import StoreVerificationOut, StoreVerificationSubmit
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