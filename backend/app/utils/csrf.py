"""
CSRF (Cross-Site Request Forgery) protection utilities.
"""
import secrets
import time
from typing import Optional
from fastapi import Request, HTTPException, status
from jose import JWTError, jwt

from ..config import settings

CSRF_TOKEN_EXPIRE_SECONDS = 3600  # 1 hour


def generate_csrf_token(user_id: int) -> str:
    """Generate a signed CSRF token bound to a specific user."""
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "type": "csrf",
        "nonce": secrets.token_urlsafe(16),
        "iat": now,
        "exp": now + CSRF_TOKEN_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def store_csrf_token(user_id: int, token: str):
    """Compatibility no-op for legacy callers."""
    return None


def validate_csrf_token(user_id: int, token: Optional[str]) -> bool:
    """
    Validate a CSRF token for a user.
    
    Returns:
        True if token is valid, False otherwise
    """
    if not token:
        return False
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return False

    if payload.get("type") != "csrf":
        return False
    return payload.get("sub") == str(user_id)


def get_csrf_token_from_request(request: Request) -> Optional[str]:
    """Extract CSRF token from request headers or form data."""
    # Check X-CSRF-Token header first (preferred)
    token = request.headers.get("X-CSRF-Token")
    if token:
        return token
    
    # Check X-XSRF-Token header (alternative)
    token = request.headers.get("X-XSRF-Token")
    if token:
        return token
    
    # Check form data (for form submissions)
    if hasattr(request, "_form") and request._form:
        form_data = request._form
        if isinstance(form_data, dict):
            return form_data.get("csrf_token")
    
    return None


def require_csrf_token(request: Request, user_id: int):
    """
    Validate CSRF token for a request.
    
    Raises:
        HTTPException if token is missing or invalid
    """
    # Skip CSRF check for GET, HEAD, OPTIONS requests
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return
    
    token = get_csrf_token_from_request(request)
    if not validate_csrf_token(user_id, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing CSRF token"
        )


def cleanup_expired_tokens():
    """Stateless CSRF tokens do not require server-side cleanup."""
    return None

