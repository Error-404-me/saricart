# backend/app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "SariCart API")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./saricart.db")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "insecure-dev-secret-change-me")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "5"))

    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    DOCS_USERNAME: str = os.getenv("DOCS_USERNAME", "admin")
    DOCS_PASSWORD: str = os.getenv("DOCS_PASSWORD", "")

    VAPID_PUBLIC_KEY: str = os.getenv("VAPID_PUBLIC_KEY", "")
    VAPID_PRIVATE_KEY: str = os.getenv("VAPID_PRIVATE_KEY", "")
    VAPID_SUBJECT: str = os.getenv("VAPID_SUBJECT", "mailto:pasuquinargie29@gmail.com")

    # --- Email: HTTP APIs only. Resend tried first, Brevo as fallback.
    # Blank in dev logs emails instead of sending. ---
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL: str = os.getenv("RESEND_FROM_EMAIL", "SariCart <no-reply@saricart.app>")

    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")

    # --- Compliance ---
    ACCOUNT_DELETION_RETENTION_DAYS: int = int(os.getenv("ACCOUNT_DELETION_RETENTION_DAYS", "30"))


settings = Settings()