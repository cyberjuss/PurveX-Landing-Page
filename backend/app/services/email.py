"""
Email delivery service for PurveX.

Supports three providers:
- "console"   — logs email content to stdout (dev/testing)
- "smtp"      — sends via SMTP (aiosmtplib)
- "sendgrid"  — sends via SendGrid HTTP API (httpx)

Usage:
    from app.services.email import send_email
    await send_email(to="user@example.com", subject="Reset", html=html_body)
"""
import logging
from typing import Optional

from ..config import settings

logger = logging.getLogger("purvex.email")


async def send_email(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
) -> bool:
    """
    Send an email using the configured provider.
    Returns True on success, False on failure (never raises).
    """
    provider = settings.EMAIL_PROVIDER.lower()
    try:
        if provider == "smtp":
            return await _send_smtp(to, subject, html, text)
        elif provider == "sendgrid":
            return await _send_sendgrid(to, subject, html, text)
        else:
            return _send_console(to, subject, html)
    except Exception as exc:
        logger.error("Failed to send email to %s via %s: %s", to, provider, exc)
        return False


def _send_console(to: str, subject: str, html: str) -> bool:
    """Log the email to stdout — useful for dev and testing."""
    logger.info(
        "--- EMAIL (console provider) ---\n"
        "  To:      %s\n"
        "  Subject: %s\n"
        "  Body:\n%s\n"
        "--- END EMAIL ---",
        to,
        subject,
        html[:500],
    )
    return True


async def _send_smtp(
    to: str, subject: str, html: str, text: Optional[str]
) -> bool:
    """Send via SMTP using aiosmtplib."""
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    import aiosmtplib

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
    msg["To"] = to
    msg["Subject"] = subject

    if text:
        msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USERNAME,
        password=settings.SMTP_PASSWORD,
        use_tls=settings.SMTP_USE_TLS,
        start_tls=not settings.SMTP_USE_TLS,
    )
    logger.info("Email sent to %s via SMTP", to)
    return True


async def _send_sendgrid(
    to: str, subject: str, html: str, text: Optional[str]
) -> bool:
    """Send via SendGrid v3 Mail Send API."""
    import httpx

    payload = {
        "personalizations": [{"to": [{"email": to}]}],
        "from": {
            "email": settings.EMAIL_FROM_ADDRESS,
            "name": settings.EMAIL_FROM_NAME,
        },
        "subject": subject,
        "content": [],
    }
    if text:
        payload["content"].append({"type": "text/plain", "value": text})
    payload["content"].append({"type": "text/html", "value": html})

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=10.0,
        )
        resp.raise_for_status()

    logger.info("Email sent to %s via SendGrid", to)
    return True
