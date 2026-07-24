from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.user import UserUpdate, NotificationPreferences


def update_profile(db: Session, user: User, update_in: UserUpdate) -> User:
    updates = update_in.model_dump(exclude_unset=True)

    if "username" in updates and updates["username"] != user.username:
        if db.query(User).filter(User.username == updates["username"]).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="This username is already taken."
            )

    if "email" in updates and updates["email"] != user.email:
        if db.query(User).filter(User.email == updates["email"]).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect."
        )
    user.password_hash = hash_password(new_password)
    db.commit()


def update_notification_preferences(db: Session, user: User, prefs: NotificationPreferences) -> User:
    user.notify_order_updates = prefs.notify_order_updates
    user.notify_promotions = prefs.notify_promotions
    user.notify_low_stock = prefs.notify_low_stock
    db.commit()
    db.refresh(user)
    return user


def delete_account(db: Session, user: User, password: str) -> None:
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is incorrect.")

    # Block deletion when there's dependent data, rather than orphaning
    # products or another party's order history, or cascading a destructive
    # delete no one explicitly asked for.
    has_products = db.query(Product).filter(Product.owner_id == user.id).first() is not None
    has_orders = (
        db.query(Order)
        .filter((Order.customer_id == user.id) | (Order.owner_id == user.id))
        .first()
        is not None
    )
    if has_products or has_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account has products or order history and can't be deleted automatically. Contact support for help closing your account.",
        )

    db.delete(user)
    db.commit()