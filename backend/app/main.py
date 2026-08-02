import os
import secrets

import logging
from fastapi.responses import JSONResponse
from fastapi.requests import Request

from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.database import Base, engine
from app.models import (  # noqa: F401
    favorite, notification, order, order_item, product, push_subscription, review,
    stock_history, store, user, audit_log, email_verification, password_reset, store_verification,
)
from app.routes import (
    analytics, audit, auth, customers, notifications, orders, products, push, reviews,
    store_verification as store_verification_routes, stores, users,
)

logger = logging.getLogger(__name__)

if settings.ENVIRONMENT != "development" and settings.SECRET_KEY == "insecure-dev-secret-change-me":
    raise RuntimeError("SECRET_KEY must be set to a strong random value in production.")

if settings.ENVIRONMENT == "development":
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

is_dev = settings.ENVIRONMENT == "development"

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if is_dev else None,
    redoc_url=None,
    openapi_url="/openapi.json" if is_dev else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SecurityHeadersMiddleware)

security = HTTPBasic()


def verify_docs_credentials(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    correct_username = secrets.compare_digest(credentials.username, settings.DOCS_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, settings.DOCS_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials", headers={"WWW-Authenticate": "Basic"})
    return credentials.username


if not is_dev:

    @app.get("/docs", include_in_schema=False)
    def protected_docs(username: str = Depends(verify_docs_credentials)):
        return get_swagger_ui_html(openapi_url="/openapi.json", title=f"{settings.APP_NAME} — docs")

    @app.get("/openapi.json", include_in_schema=False)
    def protected_openapi(username: str = Depends(verify_docs_credentials)):
        return get_openapi(title=app.title, version="1.0.0", routes=app.routes)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.ENVIRONMENT == "development":
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(stores.router)
app.include_router(reviews.router)
app.include_router(customers.router)
app.include_router(notifications.router)
app.include_router(push.router)
app.include_router(audit.router)
app.include_router(store_verification_routes.router)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Ensures every response — including crashes — passes back through
    CORSMiddleware, so the frontend sees a real error message instead of
    a misleading CORS block."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}