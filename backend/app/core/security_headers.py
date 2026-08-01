from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Defense-in-depth headers on every API response. camera=(self) is
    kept enabled since the barcode scanner requires camera access."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(self), geolocation=(self), microphone=(), payment=()"
        )
        if settings.ENVIRONMENT != "development":
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "img-src 'self' data: https://res.cloudinary.com; "
                f"connect-src 'self' {settings.FRONTEND_URL}; "
                "script-src 'self'; style-src 'self' 'unsafe-inline'; "
                "frame-ancestors 'none'"
            )
        return response
    