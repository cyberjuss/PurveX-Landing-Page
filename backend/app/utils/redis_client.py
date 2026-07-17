"""
Shared Redis connection for rate limiting and caching.

Falls back to None when Redis is not configured (dev/local mode),
allowing callers to use in-memory implementations.
"""
import logging
from typing import Optional

logger = logging.getLogger("purvex.redis")

_redis_client = None
_initialized = False


async def get_redis():
    """Return the shared async Redis client, or None if unavailable."""
    global _redis_client, _initialized

    if _initialized:
        return _redis_client

    _initialized = True

    from ..config import settings

    if not settings.REDIS_URL:
        if settings.DEPLOYMENT_ENV.lower() == "prod":
            logger.error("REDIS_URL not set in production")
            raise RuntimeError("REDIS_URL is required in production")
        logger.info("REDIS_URL not set — using in-memory rate limiting (dev mode)")
        return None

    try:
        import redis.asyncio as aioredis

        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=3,
        )
        # Verify connectivity
        await _redis_client.ping()
        logger.info("Connected to Redis at %s", settings.REDIS_URL)
        return _redis_client
    except Exception as exc:
        if settings.DEPLOYMENT_ENV.lower() == "prod":
            logger.error("Redis unavailable in production: %s", exc)
            raise RuntimeError("Redis is unavailable in production") from exc
        logger.warning("Redis unavailable (%s) — falling back to in-memory rate limiting", exc)
        _redis_client = None
        return None
