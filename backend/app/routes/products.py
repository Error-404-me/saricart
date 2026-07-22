from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_owner
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.schemas.stock import StockAdjustment, StockHistoryOut
from app.services import product_service, stock_service

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def browse_products(
    owner_id: int | None = None,
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    """Public catalog listing — used by customers browsing a store (Phase 5)
    and reused here to preview what a store owner's storefront looks like."""
    return product_service.list_products(db, owner_id=owner_id, category=category, search=search)


@router.get("/categories", response_model=list[str])
def browse_categories(owner_id: int | None = None, db: Session = Depends(get_db)):
    return product_service.list_categories(db, owner_id=owner_id)


@router.get("/mine", response_model=list[ProductOut])
def list_my_products(
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return product_service.list_products(
        db, owner_id=current_user.id, category=category, search=search
    )


@router.get("/stock-history", response_model=list[StockHistoryOut])
def stock_history(
    product_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return stock_service.list_stock_history(db, current_user.id, product_id)


@router.get("/barcode/{barcode}", response_model=ProductOut)
def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return product_service.get_product_by_barcode(db, current_user.id, barcode)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)


@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return product_service.create_product(db, product_in, current_user)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return product_service.update_product(db, product_id, product_in, current_user)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    product_service.delete_product(db, product_id, current_user)


@router.post("/{product_id}/image", response_model=ProductOut)
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return product_service.save_product_image(db, product_id, file, current_user)


@router.patch("/{product_id}/stock", response_model=ProductOut)
def adjust_stock(
    product_id: int,
    payload: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return stock_service.adjust_stock(db, product_id, payload.delta, current_user)
