import math
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.store import Store
from app.models.user import User
from app.schemas.store import StoreUpdate
from app.services import review_service

CLOSING_SOON_WINDOW_MINUTES = 30
EARTH_RADIUS_KM = 6371.0


def compute_status(store: Store) -> str:
    if not store.is_open:
        return "closed"
    if store.closes_at:
        now = datetime.now().time()
        today = datetime.today()
        closes_dt = datetime.combine(today, store.closes_at)
        now_dt = datetime.combine(today, now)
        if now_dt <= closes_dt and (closes_dt - now_dt) <= timedelta(
            minutes=CLOSING_SOON_WINDOW_MINUTES
        ):
            return "closing_soon"
    return "open"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def _attach_display_fields(db: Session, store: Store) -> Store:
    """Attach request-computed fields (status, rating) the schema expects.
    Plain instance attributes — not DB columns — read back out by Pydantic's
    from_attributes the same way ORM columns are."""
    store.status = compute_status(store)
    store.rating_average, store.rating_count = review_service.get_store_rating(db, store.id)
    return store


def get_or_create_store(db: Session, owner: User) -> Store:
    store = db.query(Store).filter(Store.owner_id == owner.id).first()
    if store:
        return store
    store = Store(owner_id=owner.id, name=f"{owner.username}'s store")
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


def get_my_store(db: Session, owner: User) -> Store:
    store = get_or_create_store(db, owner)
    return _attach_display_fields(db, store)


def update_my_store(db: Session, owner: User, update_in: StoreUpdate) -> Store:
    store = get_or_create_store(db, owner)
    for field, value in update_in.model_dump(exclude_unset=True).items():
        setattr(store, field, value)
    db.commit()
    db.refresh(store)
    return _attach_display_fields(db, store)


def get_store(db: Session, store_id: int) -> Store:
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found.")
    return _attach_display_fields(db, store)


def list_nearby_stores(
    db: Session, lat: float, lng: float, radius_km: float = 10.0
) -> list[Store]:
    candidates = (
        db.query(Store)
        .filter(Store.latitude.isnot(None), Store.longitude.isnot(None))
        .all()
    )

    nearby = []
    for store in candidates:
        distance = _haversine_km(lat, lng, store.latitude, store.longitude)
        if distance <= radius_km:
            store.distance_km = round(distance, 2)
            _attach_display_fields(db, store)
            nearby.append(store)

    nearby.sort(key=lambda s: s.distance_km)
    return nearby
