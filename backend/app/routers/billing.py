"""
Stripe Checkout, Customer Portal, and webhooks.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Annotated

from .. import models
from ..config import settings as app_settings
from ..db import get_db
from ..routers.auth import get_current_user
from ..services import billing as billing_service
from ..utils.tenant import require_org_id

logger = logging.getLogger("purvex.billing")

router = APIRouter(prefix="/billing", tags=["billing"])

DBSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[models.User, Depends(get_current_user)]


class CheckoutResponse(BaseModel):
    url: str


@router.post("/checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    db: DBSession,
    current_user: CurrentUser,
):
    if app_settings.STRIPE_PAYMENT_LINK_URL:
        return CheckoutResponse(url=app_settings.STRIPE_PAYMENT_LINK_URL)

    if not billing_service.stripe_available():
        raise HTTPException(status_code=501, detail="Stripe billing is not configured.")
    import stripe

    stripe.api_key = app_settings.STRIPE_SECRET_KEY
    org_id = require_org_id(current_user)
    result = await db.execute(select(models.Organization).where(models.Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    sub = await billing_service.get_or_create_subscription_row(db, org_id)
    customer_id = sub.stripe_customer_id if sub else None
    if not customer_id and org.stripe_customer_id:
        customer_id = org.stripe_customer_id

    base = app_settings.PUBLIC_BASE_URL.rstrip("/")
    success_url = f"{base}/signup?billing=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{base}/signup?billing=canceled"

    params: Dict[str, Any] = {
        "mode": "subscription",
        "line_items": [{"price": app_settings.STRIPE_PRICE_ID, "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "client_reference_id": str(org_id),
        "customer_email": current_user.email if not customer_id else None,
    }
    if customer_id:
        params["customer"] = customer_id

    try:
        session = stripe.checkout.Session.create(**params)
    except Exception as exc:
        logger.exception("Stripe checkout failed: %s", exc)
        raise HTTPException(status_code=502, detail="Unable to start checkout.") from exc

    return CheckoutResponse(url=session.url)


@router.get("/checkout-start")
async def checkout_start(
    db: DBSession,
    current_user: CurrentUser,
):
    if app_settings.STRIPE_PAYMENT_LINK_URL:
        return RedirectResponse(url=app_settings.STRIPE_PAYMENT_LINK_URL, status_code=302)

    if not billing_service.stripe_available():
        raise HTTPException(status_code=501, detail="Stripe billing is not configured.")
    import stripe

    stripe.api_key = app_settings.STRIPE_SECRET_KEY
    org_id = require_org_id(current_user)
    result = await db.execute(select(models.Organization).where(models.Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    sub = await billing_service.get_or_create_subscription_row(db, org_id)
    customer_id = sub.stripe_customer_id if sub else None
    if not customer_id and org.stripe_customer_id:
        customer_id = org.stripe_customer_id

    base = app_settings.PUBLIC_BASE_URL.rstrip("/")
    success_url = f"{base}/signup?billing=success"
    cancel_url = f"{base}/signup?billing=canceled"

    params: Dict[str, Any] = {
        "mode": "subscription",
        "line_items": [{"price": app_settings.STRIPE_PRICE_ID, "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "client_reference_id": str(org_id),
        "customer_email": current_user.email if not customer_id else None,
    }
    if customer_id:
        params["customer"] = customer_id

    try:
        session = stripe.checkout.Session.create(**params)
    except Exception as exc:
        logger.exception("Stripe checkout failed: %s", exc)
        raise HTTPException(status_code=502, detail="Unable to start checkout.") from exc

    return RedirectResponse(url=session.url, status_code=302)


@router.get("/checkout")
async def checkout_start_alias(
    db: DBSession,
    current_user: CurrentUser,
):
    return await checkout_start(db=db, current_user=current_user)


@router.post("/portal-session", response_model=CheckoutResponse)
async def create_portal_session(
    db: DBSession,
    current_user: CurrentUser,
):
    if not app_settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=501, detail="Stripe billing is not configured.")
    import stripe

    stripe.api_key = app_settings.STRIPE_SECRET_KEY
    org_id = require_org_id(current_user)
    sub = await billing_service.get_or_create_subscription_row(db, org_id)
    org_result = await db.execute(select(models.Organization).where(models.Organization.id == org_id))
    org = org_result.scalar_one_or_none()
    cid = (sub.stripe_customer_id if sub else None) or (org.stripe_customer_id if org else None)
    if not cid:
        raise HTTPException(status_code=400, detail="No Stripe customer for this organization yet.")
    base = app_settings.PUBLIC_BASE_URL.rstrip("/")
    try:
        session = stripe.billing_portal.Session.create(
            customer=cid,
            return_url=f"{base}/signup?billing=portal",
        )
    except Exception as exc:
        logger.exception("Stripe portal failed: %s", exc)
        raise HTTPException(status_code=502, detail="Unable to open billing portal.") from exc
    return CheckoutResponse(url=session.url)


@router.get("/status")
async def subscription_status(
    db: DBSession,
    current_user: CurrentUser,
):
    org_id = require_org_id(current_user)
    sub = await billing_service.get_or_create_subscription_row(db, org_id)
    if not sub:
        return {"status": None, "active": False}
    return {
        "status": sub.status,
        "active": billing_service.subscription_is_active(sub),
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "cancel_at_period_end": sub.cancel_at_period_end,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: DBSession):
    if not app_settings.STRIPE_WEBHOOK_SECRET or not app_settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=501, detail="Webhook not configured.")
    import stripe

    payload = await request.body()
    sig = request.headers.get("stripe-signature") or ""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig, app_settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as exc:
        logger.warning("Invalid Stripe webhook: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid signature") from exc

    etype = event.get("type")
    data = event.get("data", {}).get("object", {})

    try:
        if etype == "checkout.session.completed":
            org_id = int(data.get("client_reference_id") or 0)
            if not org_id:
                return {"received": True}
            customer = data.get("customer")
            sub_id = data.get("subscription")
            org_result = await db.execute(select(models.Organization).where(models.Organization.id == org_id))
            org = org_result.scalar_one_or_none()
            if not org:
                logger.warning("Stripe webhook referenced unknown organization_id=%s", org_id)
                return {"received": True}
            if customer:
                org.stripe_customer_id = customer
                await db.commit()
            await billing_service.upsert_subscription_from_stripe(
                db,
                org_id,
                stripe_customer_id=customer,
                stripe_subscription_id=sub_id,
                status="active",
                price_id=None,
                current_period_end=None,
            )
        elif etype in (
            "customer.subscription.updated",
            "customer.subscription.deleted",
        ):
            sub_id = data.get("id")
            customer = data.get("customer")
            st = data.get("status")
            cpe = data.get("current_period_end")
            cpe_dt = (
                datetime.fromtimestamp(cpe, tz=timezone.utc) if cpe else None
            )
            cancel_end = bool(data.get("cancel_at_period_end"))
            # Resolve org by subscription row
            r = await db.execute(
                select(models.Subscription).where(
                    models.Subscription.stripe_subscription_id == sub_id
                )
            )
            row = r.scalar_one_or_none()
            if row:
                await billing_service.upsert_subscription_from_stripe(
                    db,
                    row.organization_id,
                    stripe_customer_id=customer,
                    stripe_subscription_id=sub_id,
                    status=st,
                    price_id=data.get("items", {})
                    .get("data", [{}])[0]
                    .get("price", {})
                    .get("id"),
                    current_period_end=cpe_dt,
                    cancel_at_period_end=cancel_end,
                )
    except Exception as exc:
        logger.exception("Webhook handler error: %s", exc)
        raise HTTPException(status_code=500, detail="Webhook processing failed") from exc

    return {"received": True}
