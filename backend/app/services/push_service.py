import json
import logging

from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.push_subscription import PushSubscription
from app.models.user import User
from app.schemas.push_subscription import PushSubscriptionCreate

logger = logging.getLogger(__name__)


def subscribe(db: Session, user: User, payload: PushSubscriptionCreate) -> PushSubscription:
    existing = (
        db.query(PushSubscription)
        .filter(PushSubscription.endpoint == payload.endpoint)
        .first()
    )
    if existing:
        existing.user_id = user.id
        existing.p256dh = payload.keys.p256dh
        existing.auth = payload.keys.auth
        db.commit()
        db.refresh(existing)
        return existing

    subscription = PushSubscription(
        user_id=user.id,
        endpoint=payload.endpoint,
        p256dh=payload.keys.p256dh,
        auth=payload.keys.auth,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def unsubscribe(db: Session, user_id: int, endpoint: str) -> None:
    db.query(PushSubscription).filter(
        PushSubscription.user_id == user_id, PushSubscription.endpoint == endpoint
    ).delete()
    db.commit()


def send_push_to_user(
    db: Session, user_id: int, title: str, body: str | None, link: str | None
) -> None:
    """Best-effort fan-out to every device this user has subscribed from.
    Called mid-transaction from notification_service, so this only ever
    flushes — never commits. An expired subscription found here rides
    along on whatever commit the caller issues later, same as the
    notification row itself."""
    if not settings.VAPID_PRIVATE_KEY:
        return  # push not configured — silently skip

    subscriptions = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
    if not subscriptions:
        return

    payload = json.dumps({"title": title, "body": body or "", "link": link or "/"})

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": settings.VAPID_SUBJECT},
            )
        except WebPushException as exc:
            status_code = exc.response.status_code if exc.response is not None else None
            if status_code in (404, 410):
                # Browser uninstalled / permission revoked — prune it.
                db.query(PushSubscription).filter(PushSubscription.id == sub.id).delete()
                db.flush()
            else:
                logger.warning("Push failed for subscription %s: %s", sub.id, exc)
        except Exception:
            logger.exception("Unexpected error sending push to subscription %s", sub.id)