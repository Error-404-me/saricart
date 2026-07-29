import logging

from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.services import push_service

logger = logging.getLogger(__name__)

_PREFERENCE_BY_TYPE = {
    NotificationType.ORDER_PLACED: "notify_order_updates",
    NotificationType.ORDER_STATUS_CHANGED: "notify_order_updates",
    NotificationType.LOW_STOCK: "notify_low_stock",
}


def create_notification(
    db: Session,
    recipient: User,
    type_: NotificationType,
    title: str,
    body: str | None = None,
    link: str | None = None,
) -> Notification | None:
    """Best-effort on two fronts — the in-app row and the push fan-out —
    each isolated in its own SAVEPOINT so neither can break the order/stock
    operation this rides along on. Callers don't need to know push exists;
    it's entirely internal to this function."""
    pref_field = _PREFERENCE_BY_TYPE.get(type_)
    if pref_field is not None and not getattr(recipient, pref_field, True):
        return None

    notification = None
    try:
        with db.begin_nested():
            notification = Notification(
                user_id=recipient.id, type=type_, title=title, body=body, link=link
            )
            db.add(notification)
            db.flush()
    except Exception:
        logger.exception(
            "Failed to create notification (type=%s, user_id=%s)", type_.value, recipient.id
        )
        return None

    try:
        with db.begin_nested():
            push_service.send_push_to_user(db, recipient.id, title, body, link)
    except Exception:
        logger.exception("Push notification failed for user_id=%s", recipient.id)

    return notification


def list_notifications(db: Session, user_id: int, limit: int = 30) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def count_unread(db: Session, user_id: int) -> int:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read.is_(False))
        .count()
    )


def mark_read(db: Session, user_id: int, notification_id: int) -> None:
    db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user_id
    ).update({Notification.is_read: True})
    db.commit()


def mark_all_read(db: Session, user_id: int) -> None:
    db.query(Notification).filter(
        Notification.user_id == user_id, Notification.is_read.is_(False)
    ).update({Notification.is_read: True})
    db.commit()
    
def delete_notification(db: Session, user_id: int, notification_id: int) -> None:
    db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user_id
    ).delete()
    db.commit()
    
def delete_notifications(db: Session, user_id: int, notification_ids: list[int]) -> int:
    deleted_count = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.id.in_(notification_ids))
        .delete(synchronize_session=False)
    )
    db.commit()
    return deleted_count
    
def send_test_notification(db: Session, user: User) -> Notification | None:
    """Diagnostic helper — unlike create_notification, ignores the
    category preference toggles entirely, so a click always attempts
    delivery regardless of settings. Purely for verifying push works."""
    notification = None
    try:
        with db.begin_nested():
            notification = Notification(
                user_id=user.id,
                type=NotificationType.ORDER_STATUS_CHANGED,
                title="Test notification",
                body="If this reached your device, push notifications are working.",
                link="/settings/notifications",
            )
            db.add(notification)
            db.flush()
    except Exception:
        logger.exception("Failed to create test notification (user_id=%s)", user.id)
        return None

    try:
        with db.begin_nested():
            push_service.send_push_to_user(
                db,
                user.id,
                "Test notification",
                "If this reached your device, push notifications are working.",
                "/settings/notifications",
            )
    except Exception:
        logger.exception("Test push failed for user_id=%s", user.id)

    db.commit()
    return notification