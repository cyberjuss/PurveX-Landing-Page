"""
Self-service password reset endpoints.

This flow is intentionally minimal for now:
- /auth/password-reset/request accepts an email and, if the user exists,
  issues a short-lived reset token and logs it server-side (for integration
  with an email provider in production).
- /auth/password-reset/confirm accepts the token and a new password,
  validates it, enforces password history, and updates the user's password.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing_extensions import Annotated
from pydantic import BaseModel

from ..db import get_db, async_sessionmaker
from .. import models
from ..security import hash_password, verify_password, validate_password_complexity, create_access_token, decode_access_token
from ..utils.security import sanitize_email, sanitize_string
from ..config import settings as app_settings

router = APIRouter(
    prefix="/auth/password-reset",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

DBSession = Annotated[AsyncSession, Depends(get_db)]


def _password_matches_hash(candidate_password: str, hashed_password: Optional[str]) -> bool:
    if not hashed_password:
        return False
    try:
        return verify_password(candidate_password, hashed_password)
    except Exception:
        return False


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


async def _get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()


@router.post("/request", response_model=dict)
async def request_password_reset(payload: PasswordResetRequest, request: Request, db: DBSession):
    """
    Request a password reset link. For security reasons, the response is the
    same whether or not the email exists.
    """
    client_ip = request.client.host if request.client else "unknown"
    email = sanitize_email(payload.email)
    if not email:
        # Use generic message to avoid enumeration
        return {"message": "If an account exists for this email, a reset link has been generated."}

    # Rate limit reset requests per IP + email
    rate_key = f"password_reset_request:{client_ip}:{email}"
    try:
        from ..utils.rate_limit import check_rate_limit_async
        allowed, _ = await check_rate_limit_async(rate_key, max_requests=5, window_seconds=3600)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many password reset attempts. Please try again later.",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Password reset is temporarily unavailable.",
        )

    user = await _get_user_by_email(db, email)
    if not user:
        # Do not reveal whether the user exists
        return {"message": "If an account exists for this email, a reset link has been generated."}

    # Create a short-lived reset token encoded as a JWT.
    reset_token = create_access_token(
        data={
            "sub": user.email,
            "uid": user.id,
            "oid": user.organization_id,
            "purpose": "password_reset",
        },
        expires_minutes=30,
    )
    claims = decode_access_token(reset_token) or {}
    jti = claims.get("jti")
    exp = claims.get("exp")
    if not jti or not exp:
        raise HTTPException(status_code=500, detail="Failed to create reset token")
    expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
    db.add(models.PasswordResetToken(user_id=user.id, jti=jti, expires_at=expires_at))
    await db.commit()

    # Deliver the reset link via the configured email provider.
    import logging

    logger = logging.getLogger("purvex.api")

    reset_url = f"{app_settings.PUBLIC_BASE_URL}/reset-password?token={reset_token}"

    from ..services.email import send_email
    from ..services.email_templates import password_reset_email

    html = password_reset_email(reset_url, user.username or user.email)
    await send_email(to=user.email, subject="Reset your PurveX password", html=html)

    logger.info("Password reset email sent for user_id=%s", user.id)

    return {"message": "If an account exists for this email, a reset link has been generated."}


@router.post("/confirm", response_model=dict)
async def confirm_password_reset(payload: PasswordResetConfirm, db: DBSession):
    """
    Confirm a password reset using the reset token and set a new password.
    """
    token = sanitize_string(payload.token, max_length=4096)
    new_password = sanitize_string(payload.new_password, max_length=128)

    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")

    # Decode and validate the reset token
    claims = decode_access_token(token)
    if not claims or claims.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_id = claims.get("uid")
    email = claims.get("sub")
    org_id = claims.get("oid")
    jti = claims.get("jti")
    if not user_id or not email or not jti or not org_id:
        raise HTTPException(status_code=400, detail="Invalid reset token payload")

    user_result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = user_result.scalars().first()
    if not user or user.email != email or user.organization_id != org_id:
        raise HTTPException(status_code=400, detail="Invalid reset token payload")

    token_result = await db.execute(
        select(models.PasswordResetToken).where(models.PasswordResetToken.jti == jti)
    )
    token_row = token_result.scalars().first()
    if not token_row or token_row.user_id != user.id or token_row.used_at is not None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if token_row.expires_at.tzinfo is None:
        token_exp = token_row.expires_at.replace(tzinfo=timezone.utc)
    else:
        token_exp = token_row.expires_at.astimezone(timezone.utc)
    if token_exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Validate password complexity
    is_valid, error_msg = validate_password_complexity(new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Enforce password history and prevent reuse.
    history_length = getattr(app_settings, "PASSWORD_HISTORY_LENGTH", 5)

    # Check against current password
    if _password_matches_hash(new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the current password",
        )

    if history_length and history_length > 0:
        from sqlalchemy import select, desc

        history_stmt = (
            select(models.PasswordHistory)
            .where(models.PasswordHistory.user_id == user.id)
            .order_by(desc(models.PasswordHistory.created_at))
            .limit(history_length)
        )
        history_result = await db.execute(history_stmt)
        previous_passwords = history_result.scalars().all()

        for entry in previous_passwords:
            if _password_matches_hash(new_password, entry.hashed_password):
                raise HTTPException(
                    status_code=400,
                    detail="New password cannot match any of your recent passwords",
                )

    # All checks passed – update the password and history.
    new_hash = hash_password(new_password)
    user.hashed_password = new_hash
    token_row.used_at = datetime.now(timezone.utc)
    db.add(
        models.PasswordHistory(
            user_id=user.id,
            hashed_password=new_hash,
        )
    )
    await db.commit()

    # Optionally write an audit event
    async with async_sessionmaker() as session:
        session.add(
            models.AuditEvent(
                user_id=user.id,
                user_email=user.email,
                action="PASSWORD_RESET_SELF_SERVICE",
                resource_type="user",
                resource_id=str(user.id),
                details="User completed password reset via self-service flow",
            )
        )
        await session.commit()

    return {"message": "Password has been reset successfully"}

