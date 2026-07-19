from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user, require_owner
from app.models.order import OrderStatus
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate, WalkInSaleCreate
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return order_service.create_order(db, order_in, current_user)


@router.post("/walk-in", response_model=OrderOut, status_code=201)
def create_walk_in_sale(
    payload: WalkInSaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    """Ring up an in-person sale — the typical path from the barcode
    scanner, but usable for any counter sale. Completed immediately since
    there's no pickup to wait for."""
    return order_service.create_walk_in_sale(db, payload.items, current_user)


@router.get("/mine", response_model=list[OrderOut])
def my_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return order_service.list_orders_for_customer(db, current_user.id)


@router.get("/store", response_model=list[OrderOut])
def store_order_queue(
    status_filter: OrderStatus | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return order_service.list_orders_for_owner(db, current_user.id, status_filter)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = order_service.get_order(db, order_id)
    order_service.require_order_access(order, current_user)
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return order_service.update_order_status(db, order_id, payload.status, current_user)
