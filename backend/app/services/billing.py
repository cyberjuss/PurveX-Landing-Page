"""
Stripe subscription helpers.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .. import models
from ..config import settings

logger = logging.getLogger("purvex.billing")


def stripe_available() -> bool:
    return bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_PRICE_ID)


async def get_or_create_subscription_row(
    db: AsyncSession, organization_id: int
) -> Optional[models.Subscription]:
    result = await db.execute(
        select(models.Subscription).where(models.Subscription.organization_id == organization_id)
    )
    row = result.scalar_one_or_none()
    if row:
        return row
    row = models.Subscription(organization_id=organization_id)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def upsert_subscription_from_stripe(
    db: AsyncSession,
    organization_id: int,
    *,
    stripe_customer_id: Optional[str],
    stripe_subscription_id: Optional[str],
    status: Optional[str],
    price_id: Optional[str],
    current_period_end: Optional[datetime],
    cancel_at_period_end: bool = False,
) -> models.Subscription:
    result = await db.execute(
        select(models.Subscription).where(models.Subscription.organization_id == organization_id)
    )
    sub = result.scalar_one_or_none()
    if not sub:
        sub = models.Subscription(organization_id=organization_id)
        db.add(sub)
    sub.stripe_customer_id = stripe_customer_id or sub.stripe_customer_id
    sub.stripe_subscription_id = stripe_subscription_id or sub.stripe_subscription_id
    sub.status = status or sub.status
    sub.price_id = price_id or sub.price_id
    sub.current_period_end = current_period_end
    sub.cancel_at_period_end = cancel_at_period_end
    await db.commit()
    await db.refresh(sub)
    return sub


def subscription_is_active(sub: Optional[models.Subscription]) -> bool:
    if not sub or not sub.status:
        return False
    return sub.status in {"active", "trialing"}
