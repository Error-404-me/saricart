import cloudinary
import cloudinary.uploader

from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

UPLOAD_FOLDER = "saricart/products"


def upload_file(file_obj, public_id: str) -> str:
    """Uploads a file-like object to Cloudinary and returns its HTTPS URL."""
    result = cloudinary.uploader.upload(
        file_obj,
        folder=UPLOAD_FOLDER,
        public_id=public_id,
        overwrite=True,
    )
    return result["secure_url"]


def delete_file(url: str) -> None:
    """Deletes an image from Cloudinary given its URL. Best-effort — a
    failed delete shouldn't block the product update/delete it's cleaning
    up after."""
    if not url or "cloudinary.com" not in url:
        return
    try:
        public_id = _extract_public_id(url)
        if public_id:
            cloudinary.uploader.destroy(public_id)
    except Exception:
        pass


def _extract_public_id(url: str) -> str | None:
    """Cloudinary URLs look like:
    https://res.cloudinary.com/<cloud>/image/upload/v169.../saricart/products/<id>.jpg
    The public_id is the folder + filename, with the version segment and
    extension stripped out."""
    marker = "/upload/"
    if marker not in url:
        return None
    after_upload = url.split(marker, 1)[1]
    parts = after_upload.split("/", 1)
    is_version_segment = len(parts) > 1 and parts[0].startswith("v") and parts[0][1:].isdigit()
    remainder = parts[1] if is_version_segment else after_upload
    return remainder.rsplit(".", 1)[0]