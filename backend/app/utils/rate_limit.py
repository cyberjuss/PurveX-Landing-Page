"""
Rate limiting utilities for API endpoints.

Uses Redis when available (production) with automatic fallback to
in-memory storage (dev/local). The public API is unchanged so existing
callers (login, password reset, etc.) work without modification.
"""
import logging
import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List

logger = logging.getLogger("purvex.rate_limit")

# ---------------------------------------------------------------------------
# In-memory fallback (used when Redis is not configured)
# ---------------------------------------------------------------------------
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)
_rate_limit_lock = Lock()


def check_rate_limit(
    key: str,
    max_requests: int = 5,
    window_seconds: int = 60,
    clear_old: bool = True,
) -> tuple[bool, int]:
    """
    Check if a request should be rate limited (synchronous / in-memory).

    Returns:
        (is_allowed, remaining_requests)
    """
    now = time.time()
    with _rate_limit_lock:
        bucket = _rate_limit_store[key]

        if clear_old:
            bucket = [ts for ts in bucket if now - ts < window_seconds]
            _rate_limit_store[key] = bucket

        if len(bucket) >= max_requests:
            return False, 0

        bucket.append(now)
        _rate_limit_store[key] = bucket

        remaining = max_requests - len(bucket)
        return True, remaining


def clear_rate_limit(key: str):
    """Clear rate limit entries for a given key."""
    with _rate_limit_lock:
        if key in _rate_limit_store:
            del _rate_limit_store[key]


async def clear_rate_limit_async(key: str):
    """Clear rate limit state from Redis when configured, otherwise in-memory."""
    from .redis_client import get_redis

    redis = await get_redis()
    if redis is None:
        clear_rate_limit(key)
        return
    await redis.delete(key)


def get_rate_limit_info(key: str, window_seconds: int = 60) -> dict:
    """Get rate limit information for a key."""
    now = time.time()
    with _rate_limit_lock:
        bucket = list(_rate_limit_store.get(key, []))
    recent = [ts for ts in bucket if now - ts < window_seconds]
    return {
        "count": len(recent),
        "window_seconds": window_seconds,
        "oldest_request": min(recent) if recent else None,
    }


# ---------------------------------------------------------------------------
# Async / Redis-aware variant used by middleware
# ---------------------------------------------------------------------------

async def check_rate_limit_async(
    key: str,
    max_requests: int = 5,
    window_seconds: int = 60,
) -> tuple[bool, int]:
    """
    Async rate-limit check.  Uses Redis INCR+EXPIRE when available,
    otherwise delegates to the in-memory implementation.

    Returns:
        (is_allowed, remaining_requests)
    """
    from .redis_client import get_redis

    redis = await get_redis()
    if redis is None:
        return check_rate_limit(key, max_requests, window_seconds)

    try:
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, window_seconds)
        if current > max_requests:
            return False, 0
        return True, max_requests - current
    except Exception as exc:
        logger.warning("Redis rate-limit error (%s) — falling back to in-memory", exc)
        return check_rate_limit(key, max_requests, window_seconds)
