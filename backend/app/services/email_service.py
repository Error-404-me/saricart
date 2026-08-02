import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send(to_email: str, subject: str, html_body: str) -> None:
    if not settings.SMTP_HOST:
        logger.info("[email:dev-mode] to=%s subject=%s\n%s", to_email, subject, html_body)
        return
    
    logger.info("SMTP_HOST=%s", settings.SMTP_HOST)
    logger.info("SMTP_PORT=%s", settings.SMTP_PORT)
    logger.info("SMTP_USERNAME=%s", settings.SMTP_USERNAME)
    logger.info("SMTP_USE_TLS=%s", settings.SMTP_USE_TLS)

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to_email], message.as_string())
    except smtplib.SMTPAuthenticationError:
        logger.exception("SMTP auth failed for %s — check SMTP_USERNAME/SMTP_PASSWORD (Gmail needs an App Password)", settings.SMTP_USERNAME)
        raise
    except smtplib.SMTPSenderRefused:
        logger.exception("SMTP sender refused — SMTP_FROM (%s) must match the authenticated SMTP_USERNAME for Gmail", settings.SMTP_FROM)
        raise
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        raise


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