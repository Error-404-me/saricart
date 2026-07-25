import os
import uuid

from app.core.config import settings


def upload_file(file_obj, ext: str) -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as out:
        out.write(file_obj.read())
    return f"/uploads/{filename}"


def delete_file(url: str) -> None:
    filename = os.path.basename(url)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except OSError:
            pass