from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import (
    LoginRequest,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
)
from app.services.auth_service import (
    register_user,
    authenticate_user,
    verify_email,
    resend_verification,
    request_password_reset,
    reset_password,
)
from app.core.security import create_access_token
from app.core.rate_limit import limiter

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
@limiter.limit("5/hour")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user_in)


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password, request)
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return Token(access_token=access_token)


@router.post("/verify-email", response_model=UserOut)
def verify_email_endpoint(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    return verify_email(db, payload.token)


@router.post("/resend-verification", status_code=204)
@limiter.limit("3/hour")
def resend_verification_endpoint(request: Request, payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    resend_verification(db, payload.email)


@router.post("/forgot-password", status_code=204)
@limiter.limit("5/hour")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    logger.info("FORGOT_PW request received email=%s", payload.email)
    request_password_reset(db, payload.email)
    logger.info("FORGOT_PW request_password_reset returned")


@router.post("/reset-password", status_code=204)
@limiter.limit("5/hour")
def reset_password_endpoint(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_password(db, payload.token, payload.new_password)