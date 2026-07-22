import os
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.stock_history import StockHistory, StockChangeReason
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
BARCODE_CONFLICT_DETAIL = "Another product already uses this barcode."


def list_products(
    db: Session,
    owner_id: int | None = None,
    category: str | None = None,
    search: str | None = None,
) -> list[Product]:
    query = db.query(Product)
    if owner_id is not None:
        query = query.filter(Product.owner_id == owner_id)
    if category:
        query = query.filter(Product.category == category)
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(Product.name.ilike(like), Product.barcode.ilike(like))
        )
    return query.order_by(Product.created_at.desc()).all()


def list_categories(db: Session, owner_id: int | None = None) -> list[str]:
    query = db.query(Product.category).filter(Product.category.isnot(None)).distinct()
    if owner_id is not None:
        query = query.filter(Product.owner_id == owner_id)
    return sorted({row[0] for row in query.all() if row[0]})


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


def get_product_by_barcode(db: Session, owner_id: int, barcode: str) -> Product:
    product = (
        db.query(Product)
        .filter(Product.owner_id == owner_id, Product.barcode == barcode)
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No product in your catalog has this barcode.",
        )
    return product


def _require_ownership(product: Product, current_user: User) -> None:
    if product.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't own this product.",
        )


def create_product(db: Session, product_in: ProductCreate, owner: User) -> Product:
    product = Product(**product_in.model_dump(), owner_id=owner.id)
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=BARCODE_CONFLICT_DETAIL)
    db.refresh(product)
    return product


def update_product(
    db: Session, product_id: int, product_in: ProductUpdate, current_user: User
) -> Product:
    from app.services import stock_service

    product = get_product(db, product_id)
    _require_ownership(product, current_user)

    updates = product_in.model_dump(exclude_unset=True)

    if "stock" in updates:
        new_stock = updates.pop("stock")
        delta = new_stock - product.stock
        stock_service.record_stock_change(db, product, delta, StockChangeReason.ADJUSTMENT)

    for field, value in updates.items():
        setattr(product, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=BARCODE_CONFLICT_DETAIL)
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int, current_user: User) -> None:
    product = get_product(db, product_id)
    _require_ownership(product, current_user)

    # Order history keeps its own name/image snapshot (see OrderItem), so a
    # deleted product just detaches from any past orders rather than
    # blocking the delete or leaving a dangling foreign key. Same idea for
    # stock history.
    db.query(OrderItem).filter(OrderItem.product_id == product.id).update(
        {OrderItem.product_id: None}
    )
    db.query(StockHistory).filter(StockHistory.product_id == product.id).update(
        {StockHistory.product_id: None}
    )

    if product.image:
        _delete_image_file(product.image)

    db.delete(product)
    db.commit()


def save_product_image(
    db: Session, product_id: int, file: UploadFile, current_user: User
) -> Product:
    product = get_product(db, product_id)
    _require_ownership(product, current_user)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if file.content_type not in ALLOWED_IMAGE_TYPES or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, or WEBP images are allowed.",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    size = 0
    with open(filepath, "wb") as out:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                out.close()
                os.remove(filepath)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Image must be under {settings.MAX_IMAGE_SIZE_MB}MB.",
                )
            out.write(chunk)

    # Replace any previous image now that the new one is safely written
    if product.image:
        _delete_image_file(product.image)

    product.image = f"/uploads/{filename}"
    db.commit()
    db.refresh(product)
    return product


def _delete_image_file(image_url: str) -> None:
    filename = os.path.basename(image_url)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except OSError:
            pass
