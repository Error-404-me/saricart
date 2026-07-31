import os
from decimal import Decimal

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order_item import OrderItem
from app.models.product import Product, ProductUnit, DECIMAL_ALLOWED_UNITS, UNIT_HIERARCHY
from app.models.stock_history import StockHistory, StockChangeReason
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from app.services import storage_service
from io import BytesIO

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


def _validate_stock_for_unit(
    unit: ProductUnit, stock: Decimal, sub_unit: ProductUnit | None = None
) -> None:
    """Whole-number units (pc, dozen, box, sack, pack, bundle) must carry
    whole-number stock — UNLESS the product also sells a configured
    sub-unit (e.g. a sack sold by the kg). In that case fractional
    primary-unit stock is the expected, correct result of sub-unit sales
    (selling 1kg off a 50kg sack leaves 0.98 sacks in stock), so it's
    explicitly allowed rather than rejected."""
    if sub_unit is not None:
        return
    if unit not in DECIMAL_ALLOWED_UNITS and stock % 1 != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock must be a whole number for unit '{unit.value}'.",
        )


def _resolve_sub_unit(
    unit: ProductUnit, sub_unit: ProductUnit | None, sub_unit_ratio: Decimal | None
) -> tuple[ProductUnit | None, Decimal | None]:
    """Validates (sub_unit, sub_unit_ratio) against the selling unit and
    returns the values to persist, auto-filling the ratio for pairs with
    a universally fixed conversion (kg/g, L/ml, dozen/pc)."""
    if sub_unit is None:
        return None, None

    hierarchy = UNIT_HIERARCHY.get(unit)
    if not hierarchy or hierarchy["sub_unit"] != sub_unit:
        valid = hierarchy["sub_unit"].value if hierarchy else "none"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{unit.value}' can only optionally be sold by '{valid}', not '{sub_unit.value}'.",
        )

    if hierarchy["fixed_ratio"] is not None:
        return sub_unit, hierarchy["fixed_ratio"]

    if not sub_unit_ratio or sub_unit_ratio <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Enter how many {sub_unit.value} make up one {unit.value}.",
        )
    return sub_unit, sub_unit_ratio


def create_product(db: Session, product_in: ProductCreate, owner: User) -> Product:
    sub_unit, sub_unit_ratio = _resolve_sub_unit(
        product_in.unit, product_in.sub_unit, product_in.sub_unit_ratio
    )
    _validate_stock_for_unit(product_in.unit, product_in.stock, sub_unit)

    payload = product_in.model_dump(exclude={"sub_unit", "sub_unit_ratio"})
    product = Product(
        **payload, sub_unit=sub_unit, sub_unit_ratio=sub_unit_ratio, owner_id=owner.id
    )
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
    effective_unit = updates.get("unit", product.unit)

    # Resolve sub-unit config first — whether fractional stock is valid
    # for this unit depends on it.
    if "sub_unit" in updates or "sub_unit_ratio" in updates or "unit" in updates:
        requested_sub_unit = updates.get("sub_unit", product.sub_unit)
        requested_ratio = updates.get("sub_unit_ratio", product.sub_unit_ratio)
        resolved_sub_unit, resolved_ratio = _resolve_sub_unit(
            effective_unit, requested_sub_unit, requested_ratio
        )
        updates["sub_unit"] = resolved_sub_unit
        updates["sub_unit_ratio"] = resolved_ratio
        effective_sub_unit = resolved_sub_unit
    else:
        effective_sub_unit = product.sub_unit

    # Only validate stock when it's actually being changed here. Stock
    # can legitimately drift to a fractional value in the primary unit
    # through sub-unit sales (e.g. selling 1kg off a 25kg sack leaves
    # 24.96 sacks) — re-validating an untouched, already-fractional value
    # on unrelated edits (price, name, category, etc.) would incorrectly
    # block the save.
    if "stock" in updates:
        new_stock = updates.pop("stock")
        _validate_stock_for_unit(effective_unit, new_stock, effective_sub_unit)
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

    db.query(OrderItem).filter(OrderItem.product_id == product.id).update(
        {OrderItem.product_id: None}
    )
    db.query(StockHistory).filter(StockHistory.product_id == product.id).update(
        {StockHistory.product_id: None}
    )

    if product.image:
        storage_service.delete_file(product.image)

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

    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    contents = file.file.read(max_bytes + 1)
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image must be under {settings.MAX_IMAGE_SIZE_MB}MB.",
        )

    old_image = product.image
    product.image = storage_service.upload_file(BytesIO(contents), ext, file.content_type)
    db.commit()
    db.refresh(product)

    if old_image:
        storage_service.delete_file(old_image)

    return product