import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings
from .db import Base, async_engine
from .middleware.csrf import CSRFProtectionMiddleware
from .middleware.security import RequestLoggingMiddleware, SecurityHeadersMiddleware
from .routers import auth
from .routers import billing as billing_router
from .routers import password_reset as password_reset_router
from .routers import waitlist as waitlist_router

logger = logging.getLogger("purvex.auth_api")

app = FastAPI(title="PurveX Auth API")


@app.on_event("startup")
async def startup() -> None:
    jwt_secret = (settings.JWT_SECRET_KEY or "").strip()
    if not jwt_secret or jwt_secret.lower() in {
        "replace-me-with-a-strong-secret",
        "super-secret-change-me-in-production",
    }:
        raise RuntimeError("JWT_SECRET_KEY must be set to a strong non-placeholder value.")

    if settings.CREATE_DEFAULT_ADMIN:
        raise RuntimeError("CREATE_DEFAULT_ADMIN must remain disabled for the dedicated landing app.")

    if settings.database_url.startswith("sqlite"):
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Purvex-Silent"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CSRFProtectionMiddleware)

app.include_router(auth.router)
app.include_router(password_reset_router.router)
app.include_router(billing_router.router)
app.include_router(waitlist_router.router)


@app.get("/")
async def root():
    return {"message": "PurveX auth backend running"}


@app.get("/health")
async def health():
    return {"ok": True}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    # Sanitize validation errors to avoid leaking internal field paths or schema details.
    safe_messages = [err.get("msg", "Validation error") for err in exc.errors()]
    if not safe_messages:
        safe_messages = ["Invalid request payload."]
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request payload.", "errors": safe_messages},
    )
