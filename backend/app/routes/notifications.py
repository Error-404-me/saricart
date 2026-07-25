from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationOut, NotificationSummary
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_my_notifications(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return notification_service.list_notifications(db, current_user.id)


@router.get("/unread-count", response_model=NotificationSummary)
def unread_count(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return {"unread_count": notification_service.count_unread(db, current_user.id)}


@router.patch("/{notification_id}/read", status_code=204)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service.mark_read(db, current_user.id, notification_id)


@router.patch("/read-all", status_code=204)
def mark_all_notifications_read(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    notification_service.mark_all_read(db, current_user.id)