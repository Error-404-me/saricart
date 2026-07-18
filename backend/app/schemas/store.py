from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StoreUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    is_open: Optional[bool] = None
    closes_at: Optional[time] = None


class StoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    owner_username: Optional[str] = None
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_open: bool
    closes_at: Optional[time] = None
    status: str  # "open" | "closing_soon" | "closed" — computed, see store_service
    rating_average: Optional[float] = None
    rating_count: int = 0
    created_at: datetime
    updated_at: datetime


class NearbyStoreOut(StoreOut):
    distance_km: float
