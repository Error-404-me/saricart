from datetime import datetime, timezone

from fastapi import HTTPException, status

from sqlalchemy.orm import Session

from app.models.audit_log import AuditAction
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password
from app.services import audit_service, email_service
import logging
logger = logging.getLogger(__name__)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def register_user(db: Session, user_in: UserCreate) -> User:
    if not user_in.accepted_terms or not user_in.accepted_privacy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must agree to the Terms and Conditions and Privacy Policy.",
        )
    if get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )
    if get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken.",
        )

    now = datetime.now(timezone.utc)
    user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=user_in.role,
        terms_accepted_at=now,
        privacy_accepted_at=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("REGISTER user_id=%s email=%s committed", user.id, user.email)

    if user.role == UserRole.OWNER:
        from app.services.store_service import get_or_create_store
        get_or_create_store(db, user)

    logger.info("REGISTER calling _issue_verification_email user_id=%s", user.id)
    _issue_verification_email(db, user)
    db.commit()
    logger.info("REGISTER verification email flow completed user_id=%s", user.id)
    return user


def _issue_verification_email(db: Session, user: User) -> None:
    token = EmailVerificationToken(user_id=user.id)
    db.add(token)
    db.commit()
    db.refresh(token)
    email_service.send_verification_email(user.email, user.username, token.token)


def resend_verification(db: Session, email: str) -> None:
    """Never reveals whether the email is registered or already verified."""
    user = get_user_by_email(db, email)
    if not user or user.email_verified:
        return
    _issue_verification_email(db, user)


def verify_email(db: Session, token_value: str) -> User:
    token = (
        db.query(EmailVerificationToken)
        .filter(EmailVerificationToken.token == token_value)
        .first()
    )
    if not token or token.is_used or token.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification link is invalid or has expired.",
        )
    user = token.user
    user.email_verified = True
    token.used_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str, request=None) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        audit_service.log_action(
            db, AuditAction.LOGIN_FAILED, description=f"Failed login for {email}", request=request
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox or resend the verification email.",
        )

    # Logging in during the retention window cancels a pending deletion.
    if user.deleted_at is not None:
        user.deleted_at = None
        user.purge_at = None

    audit_service.log_action(db, AuditAction.LOGIN_SUCCESS, user_id=user.id, request=request)
    db.commit()
    return user


# auth_service.py
def request_password_reset(db: Session, email: str) -> None:
    user = get_user_by_email(db, email)
    if not user:
        logger.info("FORGOT_PW no account for email=%s — silently ignored", email)
        return
    reset_token = PasswordResetToken(user_id=user.id)
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    logger.info("FORGOT_PW token created user_id=%s — sending email", user.id)
    email_service.send_password_reset_email(user.email, user.username, reset_token.token)
    logger.info("FORGOT_PW send_password_reset_email returned")


def reset_password(db: Session, token_value: str, new_password: str) -> None:
    token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token == token_value)
        .first()
    )
    if not token or token.is_used or token.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired.",
        )
    user = token.user
    user.password_hash = hash_password(new_password)
    token.used_at = datetime.now(timezone.utc)
    audit_service.log_action(db, AuditAction.PASSWORD_RESET, user_id=user.id)
    db.commit()