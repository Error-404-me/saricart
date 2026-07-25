from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType
from app.models.user import User

# Maps each notification type to the User preference column that gates it
# (the toggles already live on Settings > Notifications). A type with no
# entry here always fires.
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
    """Queues a notification for insertion — deliberately does NOT commit.
    Callers (order/stock services) are usually mid-transaction; this rides
    along on whatever commit they issue at the end of their own operation,
    so a notification never persists for a change that itself got rolled
    back."""
    pref_field = _PREFERENCE_BY_TYPE.get(type_)
    if pref_field is not None and not getattr(recipient, pref_field, True):
        return None  # recipient opted out of this category

    notification = Notification(
        user_id=recipient.id, type=type_, title=title, body=body, link=link
    )
    db.add(notification)
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