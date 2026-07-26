from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.push_subscription import PushSubscriptionCreate, PushSubscriptionDelete
from app.services import push_service

router = APIRouter(prefix="/api/push", tags=["push"])


@router.get("/vapid-public-key")
def get_vapid_public_key():
    return {"public_key": settings.VAPID_PUBLIC_KEY}


@router.post("/subscribe", status_code=201)
def subscribe(
    payload: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    push_service.subscribe(db, current_user, payload)
    return {"status": "subscribed"}


@router.post("/unsubscribe", status_code=204)
def unsubscribe(
    payload: PushSubscriptionDelete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    push_service.unsubscribe(db, current_user.id, payload.endpoint)