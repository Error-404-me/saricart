import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database import Base, engine
from app.models import order, order_item, product, review, stock_history, store, user  # noqa: F401 (ensures models are registered on Base)
from app.routes import analytics, auth, orders, products, reviews, stores, users

# Dev convenience: auto-create tables. Swap for Alembic migrations in production.
Base.metadata.create_all(bind=engine)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "https://saricart.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(stores.router)
app.include_router(reviews.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
