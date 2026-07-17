from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Annotated

from .. import models, schemas
from ..config import settings
from ..db import get_db
from ..services.email import send_email
from ..services.email_templates import (
    waitlist_confirmation_email,
    waitlist_internal_notification_email,
)

router = APIRouter(prefix="/waitlist", tags=["waitlist"])

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=schemas.WaitlistResponse, status_code=status.HTTP_201_CREATED)
async def join_waitlist(payload: schemas.WaitlistCreate, request: Request, db: DBSession):
    # Rate limit waitlist signups per IP
    client_ip = request.client.host if request.client else "unknown"
    try:
        from ..utils.rate_limit import check_rate_limit_async
        allowed, _ = await check_rate_limit_async(
            f"waitlist:{client_ip}", max_requests=10, window_seconds=3600
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
    except HTTPException:
        raise
    except Exception:
        pass  # Allow if rate limiter is unavailable

    email = payload.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Enter a valid work email.")

    source = (payload.source or "landing-hero").strip() or "landing-hero"

    existing = await db.execute(select(models.WaitlistEntry).where(models.WaitlistEntry.email == email))
    entry = existing.scalar_one_or_none()
    if entry:
        return schemas.WaitlistResponse(email=email, already_exists=True)

    db.add(
        models.WaitlistEntry(
            email=email,
            source=source,
        )
    )
    await db.commit()

    await send_email(
        to=email,
        subject="You're on the PurveX waitlist",
        html=waitlist_confirmation_email(email),
    )

    internal_recipient = settings.SUPPORT_EMAIL or settings.PRIMARY_CONTACT_EMAIL
    if internal_recipient:
        await send_email(
            to=internal_recipient,
            subject="New PurveX waitlist signup",
            html=waitlist_internal_notification_email(email, source),
        )

    return schemas.WaitlistResponse(email=email, already_exists=False)
