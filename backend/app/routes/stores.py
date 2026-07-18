from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user, require_owner
from app.models.user import User
from app.schemas.store import StoreOut, StoreUpdate, NearbyStoreOut
from app.schemas.review import ReviewOut
from app.services import store_service, review_service

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.get("/nearby", response_model=list[NearbyStoreOut])
def nearby_stores(
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return store_service.list_nearby_stores(db, lat, lng, radius_km)


@router.get("/mine", response_model=StoreOut)
def my_store(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return store_service.get_my_store(db, current_user)


@router.patch("/mine", response_model=StoreOut)
def update_my_store(
    payload: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return store_service.update_my_store(db, current_user, payload)


@router.get("/{store_id}", response_model=StoreOut)
def get_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return store_service.get_store(db, store_id)


@router.get("/{store_id}/reviews", response_model=list[ReviewOut])
def store_reviews(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return review_service.list_store_reviews(db, store_id)
