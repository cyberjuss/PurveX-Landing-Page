"""
CSRF protection middleware for FastAPI.
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging

from ..utils.csrf import validate_csrf_token, get_csrf_token_from_request, cleanup_expired_tokens
from ..security import decode_access_token

logger = logging.getLogger("purvex.api.csrf")


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    CSRF protection middleware.

    Validates CSRF tokens for state-changing requests (POST, PUT, DELETE, PATCH).
    Skips validation for GET, HEAD, OPTIONS requests.
    """

    # Endpoints that don't require CSRF protection
    EXEMPT_PATHS = [
        "/health",
        "/ready",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/waitlist",
        "/auth/register",
        "/auth/login",
        "/auth/sso/start",
        "/auth/sso/callback",
        "/auth/password-reset/request",
        "/auth/password-reset/confirm",
        "/billing/webhook",
    ]

    async def dispatch(self, request: Request, call_next):
        # Skip CSRF check for exempt paths
        if any(request.url.path.startswith(path) for path in self.EXEMPT_PATHS):
            return await call_next(request)

        # Skip CSRF check for read-only methods
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return await call_next(request)

        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.lower().startswith("bearer "):
                token = auth_header.split(" ", 1)[1].strip() or None

        if token:
            payload = decode_access_token(token)
            user_id = payload.get("uid") if payload else None
            if not user_id:
                return JSONResponse(status_code=401, content={"detail": "Invalid authentication token"})
            csrf_token = get_csrf_token_from_request(request)
            if not validate_csrf_token(int(user_id), csrf_token):
                return JSONResponse(status_code=403, content={"detail": "Invalid or missing CSRF token"})

        response = await call_next(request)
        return response

