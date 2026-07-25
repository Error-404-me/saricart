import os

import secrets

from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database import Base, engine
from app.models import favorite, notification, order, order_item, product, review, stock_history, store, user  # noqa: F401
from app.routes import analytics, auth, customers, notifications, orders, products, reviews, stores, users

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

security = HTTPBasic()


def verify_docs_credentials(credentials: HTTPBasicCredentials = Depends(security)) -> str:
    correct_username = secrets.compare_digest(credentials.username, settings.DOCS_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, settings.DOCS_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
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


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
