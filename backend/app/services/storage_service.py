import uuid

from app.core.config import settings
from app.services import cloudinary_service, local_storage_service


def _is_local_environment() -> bool:
    return settings.ENVIRONMENT == "development"


def upload_file(file_obj, ext: str, content_type: str) -> str:
    """Local disk in development — fast, free, no external calls while
    iterating. Cloudinary in production, since Render's filesystem doesn't
    persist between deploys or restarts."""
    if _is_local_environment():
        return local_storage_service.upload_file(file_obj, ext)
    return cloudinary_service.upload_file(file_obj, uuid.uuid4().hex)


def delete_file(url: str) -> None:
    """Same switch as upload_file — one variable decides both, so there's
    no separate rule to keep in sync."""
    if _is_local_environment():
        local_storage_service.delete_file(url)
    else:
        cloudinary_service.delete_file(url)