from typing import Annotated, Optional
from datetime import datetime, timedelta, timezone
import asyncio
import base64
import hashlib
import json
import logging
import re
import secrets
import threading
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt

from ..db import get_db, async_sessionmaker
from .. import models, schemas
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    validate_password_complexity,
)
from ..config import settings as app_settings

router = APIRouter(prefix="/auth", tags=["auth"])

DBSession = Annotated[AsyncSession, Depends(get_db)]
_SSO_TIMEOUT_SECONDS = 10
_SSO_STATE_TTL_SECONDS = 600
_sso_state_store: dict[str, dict[str, str | datetime]] = {}
_sso_state_lock = threading.Lock()
_LOCAL_NEXT_PATH = "/signup?sso=checkout"


def _pkce_challenge(verifier: str) -> str:
    digest = hashlib.sha256(verifier.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")


def _sanitize_next_path(next_path: Optional[str]) -> str:
    if not next_path:
        return _LOCAL_NEXT_PATH
    decoded = urllib.parse.unquote(next_path).strip()
    if not decoded.startswith("/"):
        return _LOCAL_NEXT_PATH
    if decoded.startswith("//") or "\\" in decoded or re.search(r"[\x00-\x1f]", decoded):
        return _LOCAL_NEXT_PATH
    parts = urllib.parse.urlsplit(decoded)
    if parts.scheme or parts.netloc:
        return _LOCAL_NEXT_PATH
    return urllib.parse.urlunsplit(("", "", parts.path, parts.query, parts.fragment)) or _LOCAL_NEXT_PATH


async def _fetch_json(url: str, data: Optional[bytes] = None, headers: Optional[dict[str, str]] = None) -> dict:
    def _request() -> dict:
        req = urllib.request.Request(url, data=data, headers=headers or {})
        with urllib.request.urlopen(req, timeout=_SSO_TIMEOUT_SECONDS) as res:
            return json.loads(res.read().decode("utf-8"))

    return await asyncio.to_thread(_request)


def _store_sso_state(
    state: str,
    *,
    nonce: str,
    code_verifier: str,
    next_path: str,
    provider_name: str,
) -> None:
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=_SSO_STATE_TTL_SECONDS)
    with _sso_state_lock:
        _sso_state_store[state] = {
            "nonce": nonce,
            "code_verifier": code_verifier,
            "next_path": next_path,
            "provider_name": provider_name,
            "expires_at": expires_at,
        }
        expired_states = [
            key
            for key, entry in _sso_state_store.items()
            if not isinstance(entry.get("expires_at"), datetime) or entry["expires_at"] <= datetime.now(timezone.utc)
        ]
        for expired_state in expired_states:
            _sso_state_store.pop(expired_state, None)


def _pop_sso_state(state: str) -> Optional[dict[str, str]]:
    with _sso_state_lock:
        entry = _sso_state_store.pop(state, None)
        if not entry:
            return None
        expires_at = entry.get("expires_at")
        if not isinstance(expires_at, datetime) or expires_at <= datetime.now(timezone.utc):
            return None
        return {
            "nonce": str(entry["nonce"]),
            "code_verifier": str(entry["code_verifier"]),
            "next_path": str(entry["next_path"]),
            "provider_name": str(entry["provider_name"]),
        }


# ─── well-known OIDC issuers for built-in providers ───
_BUILTIN_PROVIDERS: dict[str, dict] = {
    "google": {
        "issuer": "https://accounts.google.com",
        "scopes": "openid email profile",
    },
    "microsoft": {
        "issuer_template": "https://login.microsoftonline.com/{tenant}/v2.0",
        "scopes": "openid email profile",
    },
}


def _resolve_provider(provider: str) -> tuple[str, str, str, str]:
    """Return (issuer, client_id, client_secret, scopes) for a named provider."""
    p = provider.lower()

    if p == "google":
        cid = app_settings.SSO_GOOGLE_CLIENT_ID
        csec = app_settings.SSO_GOOGLE_CLIENT_SECRET
        if not cid or not csec:
            raise HTTPException(status_code=400, detail="Google SSO is not configured.")
        return (
            _BUILTIN_PROVIDERS["google"]["issuer"],
            cid,
            csec,
            _BUILTIN_PROVIDERS["google"]["scopes"],
        )

    if p == "microsoft":
        cid = app_settings.SSO_MICROSOFT_CLIENT_ID
        csec = app_settings.SSO_MICROSOFT_CLIENT_SECRET
        tenant = app_settings.SSO_MICROSOFT_TENANT or "common"
        if not cid or not csec:
            raise HTTPException(status_code=400, detail="Microsoft SSO is not configured.")
        issuer = _BUILTIN_PROVIDERS["microsoft"]["issuer_template"].format(tenant=tenant)
        return (
            issuer,
            cid,
            csec,
            _BUILTIN_PROVIDERS["microsoft"]["scopes"],
        )

    # Fallback: legacy single-provider config
    issuer = (app_settings.SSO_OIDC_ISSUER or "").rstrip("/")
    cid = app_settings.SSO_OIDC_CLIENT_ID
    csec = app_settings.SSO_OIDC_CLIENT_SECRET
    if not issuer or not cid or not csec:
        raise HTTPException(status_code=400, detail=f"SSO provider '{provider}' is not configured.")
    return issuer, cid, csec, app_settings.SSO_SCOPES


async def _get_oidc_metadata(issuer: Optional[str] = None) -> dict:
    issuer = (issuer or app_settings.SSO_OIDC_ISSUER or "").rstrip("/")
    if not issuer:
        raise HTTPException(status_code=500, detail="SSO issuer is not configured.")
    return await _fetch_json(f"{issuer}/.well-known/openid-configuration")


async def _get_signing_key(id_token: str, jwks_uri: str):
    header = jwt.get_unverified_header(id_token)
    jwks = await _fetch_json(jwks_uri)
    key = next((item for item in jwks.get("keys", []) if item.get("kid") == header.get("kid")), None)
    if not key:
        raise HTTPException(status_code=400, detail="Unable to verify SSO token.")
    return key

async def get_user_by_email(db: AsyncSession, email: str) -> models.User | None:
    # Accept either email or username as the login identifier.
    result = await db.execute(
        select(models.User).where(
            (models.User.email == email) | (models.User.username == email)
        )
    )
    return result.scalars().first()


async def _get_or_create_org(db: AsyncSession) -> models.Organization:
    result = await db.execute(select(models.Organization))
    org = result.scalars().first()
    if org:
        return org
    org = models.Organization(
        name=app_settings.ORGANIZATION_NAME,
        primary_contact_email=app_settings.PRIMARY_CONTACT_EMAIL,
        timezone=app_settings.DEFAULT_TIMEZONE,
        locale=app_settings.DEFAULT_LOCALE,
        default_environment_names=app_settings.DEFAULT_ENVIRONMENT_NAMES,
        compliance_mode_flags=app_settings.COMPLIANCE_MODE_FLAGS,
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org


def _derive_workspace_name(email: str) -> str:
    local, _, domain = email.partition("@")
    domain_label = domain.split(".")[0].replace("-", " ").replace("_", " ").strip() if domain else ""
    if domain_label and domain_label.lower() not in {"gmail", "outlook", "hotmail", "yahoo", "icloud"}:
        return f"{domain_label.title()} Workspace"

    local_label = local.replace(".", " ").replace("_", " ").replace("-", " ").strip()
    if local_label:
        return f"{local_label.title()} Workspace"

    return "PurveX Workspace"


async def _ensure_admin_role(db: AsyncSession, user: models.User, org_id: int) -> None:
    role_result = await db.execute(select(models.Role).where(models.Role.name == "administrator"))
    admin_role = role_result.scalar_one_or_none()
    if not admin_role:
        return
    existing_role = await db.execute(
        select(models.UserRole).where(
            models.UserRole.user_id == user.id,
            models.UserRole.role_id == admin_role.id,
            models.UserRole.organization_id == org_id,
        )
    )
    if existing_role.scalar_one_or_none():
        return
    db.add(
        models.UserRole(
            user_id=user.id,
            role_id=admin_role.id,
            organization_id=org_id,
        )
    )
    await db.commit()


def _create_session_token(user: models.User) -> str:
    return create_access_token(
        data={
            "sub": user.email,
            "uid": user.id,
            "adm": user.is_admin,
            "oid": getattr(user, "organization_id", None),
        }
    )


def _set_access_cookie(response: Response, access_token: str) -> None:
    is_production = app_settings.DEPLOYMENT_ENV.lower() == "prod"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="strict" if is_production else "lax",
        path="/",
        max_age=app_settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def _provision_sso_user(db: AsyncSession, email: str) -> tuple[models.User, models.Organization, bool]:
    existing = await get_user_by_email(db, email)
    if existing:
        org_result = await db.execute(
            select(models.Organization).where(models.Organization.id == existing.organization_id)
        )
        org = org_result.scalars().first()
        if not org:
            raise HTTPException(status_code=500, detail="User organization not found.")
        return existing, org, False

    if not app_settings.ALLOW_PUBLIC_REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Single sign-on is only available when public registration is enabled.",
        )

    org = models.Organization(
        name=_derive_workspace_name(email),
        primary_contact_email=email,
        timezone=app_settings.DEFAULT_TIMEZONE,
        locale=app_settings.DEFAULT_LOCALE,
        default_environment_names=app_settings.DEFAULT_ENVIRONMENT_NAMES,
        compliance_mode_flags=app_settings.COMPLIANCE_MODE_FLAGS,
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)
    workspace_created = True

    username = email.split("@")[0]
    workspace_owner = workspace_created

    user = models.User(
        username=username,
        email=email,
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        is_admin=workspace_owner,
        is_active=True,
        organization_id=org.id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    if workspace_owner:
        await _ensure_admin_role(db, user, org.id)

    return user, org, workspace_created


@router.get("/bootstrap/status", response_model=schemas.BootstrapStatus)
async def bootstrap_status(db: DBSession):
    if not app_settings.BOOTSTRAP_ADMIN_ENABLED:
        return {"needs_admin": False}
    result = await db.execute(select(models.User).where(models.User.is_admin == True))
    admin = result.scalars().first()
    return {"needs_admin": admin is None}


@router.get("/sso/status", response_model=schemas.SSOStatus)
async def sso_status():
    # Legacy single-provider check
    legacy_enabled = bool(
        app_settings.SSO_ENABLED
        and app_settings.SSO_OIDC_ISSUER
        and app_settings.SSO_OIDC_CLIENT_ID
        and app_settings.SSO_OIDC_CLIENT_SECRET
    )

    # Built-in providers
    providers: list[dict[str, object]] = []
    if app_settings.SSO_GOOGLE_ENABLED and app_settings.SSO_GOOGLE_CLIENT_ID and app_settings.SSO_GOOGLE_CLIENT_SECRET:
        providers.append({"name": "google", "enabled": True})
    if app_settings.SSO_MICROSOFT_ENABLED and app_settings.SSO_MICROSOFT_CLIENT_ID and app_settings.SSO_MICROSOFT_CLIENT_SECRET:
        providers.append({"name": "microsoft", "enabled": True})

    any_enabled = legacy_enabled or len(providers) > 0

    return {
        "enabled": any_enabled,
        "provider_name": app_settings.SSO_PROVIDER_NAME if legacy_enabled else None,
        "providers": providers,
    }


@router.post("/bootstrap", response_model=schemas.UserRead)
async def bootstrap_admin(user_in: schemas.BootstrapAdminCreate, db: DBSession):
    if not app_settings.BOOTSTRAP_ADMIN_ENABLED or app_settings.DEPLOYMENT_ENV.lower() == "prod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bootstrap admin creation is disabled.",
        )
    result = await db.execute(select(models.User).where(models.User.is_admin == True))
    admin = result.scalars().first()
    if admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An admin user already exists.",
        )

    is_valid, error_msg = validate_password_complexity(user_in.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    org = await _get_or_create_org(db)
    email = user_in.email or user_in.username
    user = models.User(
        username=user_in.username,
        email=email,
        hashed_password=hash_password(user_in.password),
        is_admin=True,
        is_active=True,
        organization_id=org.id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    await _ensure_admin_role(db, user, org.id)
    return user


@router.get("/sso/start")
async def sso_start(request: Request, next: Optional[str] = None, provider: Optional[str] = None):
    # Determine which provider to use
    provider_name = (provider or "").strip().lower()

    # If a named built-in provider is requested, resolve its config
    if provider_name in ("google", "microsoft"):
        issuer, client_id, client_secret, scopes = _resolve_provider(provider_name)
    elif app_settings.SSO_ENABLED:
        # Legacy single-provider path
        provider_name = "legacy"
        issuer = (app_settings.SSO_OIDC_ISSUER or "").rstrip("/")
        client_id = app_settings.SSO_OIDC_CLIENT_ID or ""
        client_secret = app_settings.SSO_OIDC_CLIENT_SECRET or ""
        scopes = app_settings.SSO_SCOPES
        if not issuer or not client_id or not client_secret:
            raise HTTPException(status_code=500, detail="SSO issuer is not configured.")
    else:
        raise HTTPException(status_code=404, detail="SSO is not enabled.")

    metadata = await _get_oidc_metadata(issuer)
    authorization_endpoint = metadata.get("authorization_endpoint")
    if not authorization_endpoint:
        raise HTTPException(status_code=500, detail="SSO authorization endpoint is unavailable.")

    state = secrets.token_urlsafe(24)
    nonce = secrets.token_urlsafe(24)
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = _pkce_challenge(code_verifier)
    backend_public_url = (app_settings.BACKEND_PUBLIC_URL or "").rstrip("/")
    redirect_uri = (
        f"{backend_public_url}/auth/sso/callback"
        if backend_public_url
        else str(request.url_for("sso_callback"))
    )
    safe_next = _sanitize_next_path(next)
    _store_sso_state(
        state,
        nonce=nonce,
        code_verifier=code_verifier,
        next_path=safe_next,
        provider_name=provider_name,
    )

    query = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "response_type": "code",
            "redirect_uri": redirect_uri,
            "scope": scopes,
            "state": state,
            "nonce": nonce,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
        }
    )

    return RedirectResponse(url=f"{authorization_endpoint}?{query}", status_code=status.HTTP_302_FOUND)

# SECURITY: Disable public registration - only allow via admin interface
# This endpoint should be removed or restricted to admin-only in production
@router.post("/register", response_model=schemas.RegisterResponse)
async def register_admin(user_in: schemas.UserCreate, response: Response, db: DBSession):
    """
    SECURITY WARNING: This endpoint allows creating admin users.
    In production, this should be disabled or restricted to existing admins only.
    """
    # Rate limit registration attempts
    rate_key = f"register:{user_in.email}"
    try:
        from ..utils.rate_limit import check_rate_limit_async
        allowed, remaining = await check_rate_limit_async(rate_key, max_requests=3, window_seconds=3600)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many registration attempts. Please try again later."
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Registration is temporarily unavailable."
        )
    
    # Validate password complexity
    is_valid, error_msg = validate_password_complexity(user_in.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Unable to complete registration. Please try a different email or sign in.")

    if not app_settings.ALLOW_PUBLIC_REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is disabled unless public registration is enabled.",
        )

    workspace_created = False

    org = models.Organization(
        name=_derive_workspace_name(user_in.email),
        primary_contact_email=user_in.email,
        timezone=app_settings.DEFAULT_TIMEZONE,
        locale=app_settings.DEFAULT_LOCALE,
        default_environment_names=app_settings.DEFAULT_ENVIRONMENT_NAMES,
        compliance_mode_flags=app_settings.COMPLIANCE_MODE_FLAGS,
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)
    workspace_created = True

    username = user_in.username or user_in.email.split("@")[0]
    workspace_owner = workspace_created
    user = models.User(
        username=username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        is_admin=workspace_owner,
        is_active=True,
        organization_id=org.id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    if workspace_owner:
        await _ensure_admin_role(db, user, org.id)

    # Seed password history with the initial password hash to prevent the user
    # from reusing it on future password changes.
    try:
        history_length = getattr(app_settings, "PASSWORD_HISTORY_LENGTH", 5)
        if history_length and history_length > 0:
            db.add(
                models.PasswordHistory(
                    user_id=user.id,
                    hashed_password=user.hashed_password,
                )
            )
            await db.commit()
    except Exception as exc:
        await db.rollback()
        logging.getLogger("purvex.api").warning("Password history seed failed for user %s: %s", user.email, exc)
    access_token = _create_session_token(user)
    _set_access_cookie(response, access_token)

    return schemas.RegisterResponse(
        user=schemas.UserRead.model_validate(user),
        organization_id=org.id,
        organization_name=org.name,
        access_token=access_token,
        workspace_created=workspace_created,
    )


@router.get("/sso/callback", name="sso_callback")
async def sso_callback(
    request: Request,
    response: Response,
    db: DBSession,
    code: Optional[str] = None,
    state: Optional[str] = None,
):
    if not code or not state:
        raise HTTPException(status_code=400, detail="Invalid SSO state.")

    sso_state = _pop_sso_state(state)
    if not sso_state:
        raise HTTPException(status_code=400, detail="Invalid SSO state.")

    stored_nonce = sso_state.get("nonce")
    code_verifier = sso_state.get("code_verifier")
    next_path = sso_state.get("next_path") or "/signup?sso=checkout"
    provider_name = sso_state.get("provider_name") or "legacy"

    if not stored_nonce or not code_verifier:
        raise HTTPException(status_code=400, detail="Incomplete SSO session.")

    # Resolve provider credentials from the cookie set during /sso/start
    if provider_name in ("google", "microsoft"):
        issuer_url, client_id, client_secret, _ = _resolve_provider(provider_name)
    else:
        if not app_settings.SSO_ENABLED:
            raise HTTPException(status_code=404, detail="SSO is not enabled.")
        issuer_url = (app_settings.SSO_OIDC_ISSUER or "").rstrip("/")
        client_id = app_settings.SSO_OIDC_CLIENT_ID or ""
        client_secret = app_settings.SSO_OIDC_CLIENT_SECRET or ""

    metadata = await _get_oidc_metadata(issuer_url)
    token_endpoint = metadata.get("token_endpoint")
    jwks_uri = metadata.get("jwks_uri")
    issuer = metadata.get("issuer")
    if not token_endpoint or not jwks_uri or not issuer:
        raise HTTPException(status_code=500, detail="SSO provider metadata is incomplete.")

    redirect_uri = str(request.url_for("sso_callback"))
    token_payload = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret,
            "code_verifier": code_verifier,
        }
    ).encode("utf-8")
    token_data = await _fetch_json(
        token_endpoint,
        data=token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    id_token = token_data.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="SSO provider did not return an ID token.")

    signing_key = await _get_signing_key(id_token, jwks_uri)

    verify_issuer = True
    if provider_name == "microsoft":
        unverified_claims = jwt.get_unverified_claims(id_token)
        token_issuer = str(unverified_claims.get("iss") or "")
        tenant = (app_settings.SSO_MICROSOFT_TENANT or "common").strip().lower()
        if not token_issuer.startswith("https://login.microsoftonline.com/") or not token_issuer.endswith("/v2.0"):
            raise HTTPException(status_code=400, detail="Unable to verify SSO token issuer.")
        if tenant in {"common", "organizations", "consumers"}:
            issuer = token_issuer
        else:
            issuer = f"https://login.microsoftonline.com/{tenant}/v2.0"

    try:
        claims = jwt.decode(
            id_token,
            signing_key,
            algorithms=[signing_key.get("alg", "RS256")],
            audience=client_id,
            issuer=issuer if verify_issuer else None,
            options={
                "verify_at_hash": False,
                "verify_iss": verify_issuer,
            },
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Unable to verify SSO token.")

    if claims.get("nonce") != stored_nonce:
        raise HTTPException(status_code=400, detail="Invalid SSO nonce.")

    # Extract email — Microsoft may use "preferred_username" when "email"
    # is absent from the token (depends on tenant/user type).
    email = claims.get("email") or claims.get("preferred_username")
    if not email:
        raise HTTPException(status_code=400, detail="SSO account must provide an email address.")

    # Google always returns email_verified; Microsoft may not include it
    # for all tenant types, so only reject if explicitly False.
    if claims.get("email_verified") is False:
        raise HTTPException(status_code=400, detail="SSO account email is not verified.")

    user, _, _ = await _provision_sso_user(db, email.lower())
    access_token = _create_session_token(user)

    frontend_base = app_settings.FRONTEND_PUBLIC_URL.rstrip("/")
    safe_next = _sanitize_next_path(next_path)
    redirect = RedirectResponse(url=f"{frontend_base}{safe_next}", status_code=status.HTTP_302_FOUND)
    _set_access_cookie(redirect, access_token)
    return redirect

@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    request: Request,
    db: DBSession,
):
    # Rate limiting: Prevent brute force attacks
    # Use IP address + username as key
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"login:{client_ip}:{form_data.username}"

    # Load configurable policy knobs for login rate limiting.
    max_requests = getattr(app_settings, "LOGIN_RATE_LIMIT_MAX_REQUESTS", 5)
    window_seconds = getattr(app_settings, "LOGIN_RATE_LIMIT_WINDOW_SECONDS", 300)

    try:
        from ..utils.rate_limit import check_rate_limit_async
        allowed, remaining = await check_rate_limit_async(
            rate_key,
            max_requests=max_requests,
            window_seconds=window_seconds,
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please wait 5 minutes and try again."
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable.",
        )
    
    user = await get_user_by_email(db, form_data.username)
    if not user:
        # Use same error message to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # SECURITY: Check if account is locked.
    from datetime import datetime, timezone
    locked_until_raw = user.locked_until
    locked_until = None

    if locked_until_raw:
        if isinstance(locked_until_raw, datetime):
            if locked_until_raw.tzinfo is None or locked_until_raw.tzinfo.utcoffset(locked_until_raw) is None:
                locked_until = locked_until_raw.replace(tzinfo=timezone.utc)
            else:
                locked_until = locked_until_raw.astimezone(timezone.utc)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Account lockout state is invalid.",
            )

    now_utc = datetime.now(timezone.utc)
    if locked_until and locked_until > now_utc:
        # Use the same generic error message as for invalid credentials to avoid
        # leaking lockout state to attackers. The lock itself is still enforced.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Use getattr to avoid lazy loading issues in async context
    is_active = getattr(user, 'is_active', True)
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(form_data.password, user.hashed_password):
        # SECURITY: Increment failed login attempts and lock account after
        # configured number of failures.
        import logging
        logger = logging.getLogger("purvex.api")
        logger.warning("Failed login attempt for user_id=%s from IP: %s", getattr(user, "id", "unknown"), client_ip)
        
        try:
            current_attempts = user.failed_login_attempts or 0
            user.failed_login_attempts = current_attempts + 1
            
            # Lock account after N failed attempts for a configured duration.
            max_attempts = getattr(app_settings, "LOGIN_MAX_ATTEMPTS", 5)
            lockout_minutes = getattr(app_settings, "LOGIN_LOCKOUT_MINUTES", 30)
            if user.failed_login_attempts >= max_attempts:
                from datetime import timedelta
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=lockout_minutes)
                logger.warning("Account locked for user_id=%s after %d failed attempts", user.id, user.failed_login_attempts)
            
            await db.commit()
        except Exception:
            await db.rollback()
            raise
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    try:
        failed_attempts = user.failed_login_attempts
        locked_until = user.locked_until
        if (failed_attempts and failed_attempts > 0) or locked_until:
            user.failed_login_attempts = 0
            user.locked_until = None
            await db.commit()
    except Exception:
        await db.rollback()
        raise
    
    # Clear rate limit on successful login
    from ..utils.rate_limit import clear_rate_limit_async
    try:
        await clear_rate_limit_async(rate_key)
    except Exception:
        pass
    
    # SECURITY: Check if 2FA is required for this account.
    # If enabled for the user (admin or non-admin), or if the environment
    # policy requires 2FA for this user class, we do NOT create a full
    # session yet. Instead we:
    # - Issue a short-lived "two_factor_token" JWT marked as pending.
    # - Return it to the client, which will call /auth/2fa/verify.
    await db.refresh(user)

    two_factor_enabled = getattr(user, "two_factor_enabled", False)
    require_2fa_for_admins = getattr(app_settings, "REQUIRE_2FA_FOR_ADMINS", False)
    require_2fa_for_all = getattr(app_settings, "REQUIRE_2FA_FOR_ALL_USERS", False)

    must_use_2fa = two_factor_enabled or require_2fa_for_all or (require_2fa_for_admins and getattr(user, "is_admin", False))

    if must_use_2fa:
        from fastapi.responses import JSONResponse

        two_factor_token = create_access_token(
            data={
                "sub": user.email,
                "uid": user.id,
                "two_factor_pending": True,
            },
            # Short-lived token to reduce risk if intercepted.
            expires_minutes=10,
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "requires_2fa": True,
                "two_factor_token": two_factor_token,
                "message": "Two-factor authentication required",
            },
        )

    access_token = _create_session_token(user)

    # Fire‑and‑forget audit event for successful login.
    async with async_sessionmaker() as session:
        session.add(
            models.AuditEvent(
                user_id=user.id,
                user_email=user.email,
                action="LOGIN_SUCCESS",
                resource_type="auth",
                resource_id=None,
                details=None,
            )
        )
        await session.commit()

    # Set an httpOnly cookie for the primary session token.
    # Use secure cookies in non‑local environments.
    # Set cookie with explicit settings for better compatibility
    # Note: For cross-origin requests (localhost:3000 -> 127.0.0.1:8001), cookies may not be sent
    # The frontend will also send the token in the Authorization header as a fallback
    # SECURITY: Use Secure=True in production, SameSite=Strict for sensitive operations
    _set_access_cookie(response, access_token)
    
    # Log cookie setting for debugging
    import logging
    logger = logging.getLogger("purvex.api")
    logger.info("Set access_token cookie for user_id=%s, max_age=%ds", user.id, app_settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    return schemas.Token(access_token=access_token)


async def get_current_user(
    request: Request,
    db: DBSession,
) -> models.User:
    # Prefer httpOnly cookie for auth; fall back to Authorization header for
    # tooling / Swagger compatibility.
    token: str | None = request.cookies.get("access_token")
    
    # Debug: Log available cookies (without sensitive data)
    import logging
    logger = logging.getLogger("purvex.api")
    if not token:
        logger.debug(f"Cookie 'access_token' not found. Available cookies: {list(request.cookies.keys())}")

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip() or None

    if not token:
        logger.warning("Authentication failed: No token found.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    if payload.get("two_factor_pending") or payload.get("purpose") == "password_reset" or payload.get("agent_registration"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not valid for authenticated API access",
        )

    email: str | None = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = await get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if user.organization_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not assigned to an organization",
        )

    return user

@router.get("/me", response_model=schemas.UserRead)
async def read_me(current_user: Annotated[models.User, Depends(get_current_user)]):
    return current_user

@router.post("/logout", response_model=dict)
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out"}

@router.get("/test-cookie")
async def test_cookie(request: Request):
    """Test endpoint to verify cookie is being sent. Dev only."""
    if app_settings.DEPLOYMENT_ENV.lower() == "prod":
        raise HTTPException(status_code=404, detail="Not found")
    cookies = dict(request.cookies)
    has_token = "access_token" in cookies
    return {
        "cookies_received": list(cookies.keys()),
        "has_access_token": has_token,
        "cookie_count": len(cookies),
    }

@router.get("/csrf-token", response_model=dict)
async def get_csrf_token(current_user: Annotated[models.User, Depends(get_current_user)]):
    """Get a CSRF token for the current user."""
    from ..utils.csrf import generate_csrf_token, store_csrf_token
    
    token = generate_csrf_token(current_user.id)
    store_csrf_token(current_user.id, token)
    
    return {
        "csrf_token": token,
        "header_name": "X-CSRF-Token"
    }
