from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user import (
    UserOut,
    UserUpdate,
    PasswordChangeRequest,
    NotificationPreferences,
    AccountDeleteRequest,
)
from app.models.user import User
from app.services import user_service

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_current_user(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.update_profile(db, current_user, payload)


@router.patch("/me/password", status_code=204)
def change_current_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service.change_password(db, current_user, payload.current_password, payload.new_password)


@router.patch("/me/notifications", response_model=UserOut)
def update_notifications(
    payload: NotificationPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_service.update_notification_preferences(db, current_user, payload)


@router.delete("/me", status_code=204)
def delete_current_account(
    payload: AccountDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_service.delete_account(db, current_user, payload.password)