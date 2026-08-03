# backend/app/services/email_service.py
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


def _send_via_resend(to_email: str, subject: str, html_body: str) -> bool:
    try:
        response = requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            },
            timeout=10,
        )
        response.raise_for_status()
        return True
    except requests.RequestException:
        logger.exception("Resend email failed (to=%s, subject=%s)", to_email, subject)
        return False


def _send_via_smtp(to_email: str, subject: str, html_body: str) -> bool:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT_SECONDS
        ) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to_email], message.as_string())
        return True
    except (smtplib.SMTPException, OSError):
        logger.exception(
            "SMTP send failed (host=%s, port=%s, to=%s) — outbound SMTP may be "
            "blocked by your hosting provider. Consider setting RESEND_API_KEY "
            "to send over HTTPS instead.",
            settings.SMTP_HOST, settings.SMTP_PORT, to_email,
        )
        return False


def _send(to_email: str, subject: str, html_body: str) -> None:
    """Best-effort email delivery. NEVER raises — a delivery failure must
    not fail the HTTP request that triggered it (registration, password
    reset, etc.), since the underlying DB state (user row, reset token)
    is already committed by the time this runs."""
    if settings.RESEND_API_KEY:
        if _send_via_resend(to_email, subject, html_body):
            return
        # Fall through to SMTP only if explicitly configured as a backup.
        if not settings.SMTP_HOST:
            return

    if not settings.SMTP_HOST:
        logger.info("[email:dev-mode] to=%s subject=%s\n%s", to_email, subject, html_body)
        return

    _send_via_smtp(to_email, subject, html_body)


def send_verification_email(to_email: str, username: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    _send(
        to_email,
        "Verify your SariCart account",
        f"<p>Hi {username},</p>"
        f"<p>Welcome to SariCart! Please confirm your email to activate your account.</p>"
        f'<p><a href="{link}">Verify my email</a></p>'
        f"<p>This link expires in 24 hours.</p>",
    )


def send_password_reset_email(to_email: str, username: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    _send(
        to_email,
        "Reset your SariCart password",
        f"<p>Hi {username},</p>"
        f"<p>We received a request to reset your password.</p>"
        f'<p><a href="{link}">Reset my password</a></p>'
        f"<p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>",
    )


def send_account_deletion_email(to_email: str, username: str, purge_date: str) -> None:
    _send(
        to_email,
        "Your SariCart account is scheduled for deletion",
        f"<p>Hi {username},</p>"
        f"<p>Your account has been deactivated. It will be permanently "
        f"deleted on {purge_date}. Log back in before then to cancel this.</p>",
    )