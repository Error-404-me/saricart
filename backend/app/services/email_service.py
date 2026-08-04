# backend/app/services/email_service.py
import logging
import re

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _parse_sender(from_header: str) -> tuple[str, str]:
    """Parses 'Name <email@domain.com>' into (name, email). Falls back to
    treating the whole string as the email if no name is present."""
    match = re.match(r"^\s*(.*?)\s*<(.+?)>\s*$", from_header)
    if match:
        name = match.group(1).strip().strip('"') or "SariCart"
        email = match.group(2).strip()
        return name, email
    return "SariCart", from_header.strip()


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
        if not response.ok:
            logger.error(
                "Resend email failed (to=%s, subject=%s, status=%s, body=%s)",
                to_email, subject, response.status_code, response.text,
            )
        response.raise_for_status()
        return True
    except requests.RequestException:
        logger.exception("Resend email failed (to=%s, subject=%s)", to_email, subject)
        return False


def _send_via_brevo(to_email: str, subject: str, html_body: str) -> bool:
    sender_name, sender_email = _parse_sender(settings.RESEND_FROM_EMAIL)
    try:
        response = requests.post(
            BREVO_API_URL,
            headers={
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": settings.BREVO_API_KEY,
            },
            json={
                "sender": {"name": sender_name, "email": sender_email},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_body,
            },
            timeout=10,
        )
        if not response.ok:
            logger.error(
                "Brevo email failed (to=%s, subject=%s, status=%s, body=%s)",
                to_email, subject, response.status_code, response.text,
            )
        response.raise_for_status()
        return True
    except requests.RequestException:
        logger.exception("Brevo email failed (to=%s, subject=%s)", to_email, subject)
        return False


def _send(to_email: str, subject: str, html_body: str) -> None:
    """Best-effort email delivery. NEVER raises — a delivery failure must
    not fail the HTTP request that triggered it (registration, password
    reset, etc.), since the underlying DB state (user row, reset token)
    is already committed by the time this runs.

    Priority: Resend, then Brevo as HTTP-API fallback. If neither
    provider is configured, the email is logged instead of sent (dev
    mode)."""
    if not settings.RESEND_API_KEY and not settings.BREVO_API_KEY:
        logger.info("[email:dev-mode] to=%s subject=%s\n%s", to_email, subject, html_body)
        return

    if settings.RESEND_API_KEY and _send_via_resend(to_email, subject, html_body):
        return

    if settings.BREVO_API_KEY and _send_via_brevo(to_email, subject, html_body):
        return

    logger.error(
        "Email delivery failed via all configured providers (to=%s, subject=%s)",
        to_email, subject,
    )


def _render_email(heading: str, paragraphs: list[str], link: str | None = None, link_label: str | None = None) -> str:
    body_paragraphs = "\n".join(f"    <p>{p}</p>" for p in paragraphs)
    link_block = (
        f'    <p><a href="{link}">{link_label}</a></p>\n'
        f'    <p style="color:#6e7d77;font-size:13px;">'
        f'If the link above doesn\'t work, copy and paste this URL into your browser:<br>'
        f'{link}</p>\n'
        if link
        else ""
    )
    return f"""<!doctype html>
<html>
  <body style="font-family: sans-serif; color: #1b2e2a;">
    <h2>{heading}</h2>
{body_paragraphs}
{link_block}    <p style="color:#6e7d77;font-size:13px;">— SariCart</p>
  </body>
</html>"""


def send_verification_email(to_email: str, username: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html_body = _render_email(
        heading="Verify your SariCart account",
        paragraphs=[
            f"Hi {username},",
            "Welcome to SariCart! Please confirm your email to activate your account.",
            "This link expires in 24 hours.",
        ],
        link=link,
        link_label="Verify my email",
    )
    _send(to_email, "Verify your SariCart account", html_body)


def send_password_reset_email(to_email: str, username: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html_body = _render_email(
        heading="Reset your SariCart password",
        paragraphs=[
            f"Hi {username},",
            "We received a request to reset your password.",
            "This link expires in 1 hour. If you didn't request this, ignore this email.",
        ],
        link=link,
        link_label="Reset my password",
    )
    _send(to_email, "Reset your SariCart password", html_body)


def send_account_deletion_email(to_email: str, username: str, purge_date: str) -> None:
    html_body = _render_email(
        heading="Your SariCart account is scheduled for deletion",
        paragraphs=[
            f"Hi {username},",
            "Your account has been deactivated. It will be permanently deleted on "
            f"{purge_date}. Log back in before then to cancel this.",
        ],
    )
    _send(to_email, "Your SariCart account is scheduled for deletion", html_body)