from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class FavoriteStoreOut(BaseModel):
    id: int
    store_id: int
    store_name: str
    owner_id: int
    status: str
    rating_average: Optional[float] = None
    rating_count: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    favorited_at: datetime


class ReorderableItem(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    owner_id: Optional[int] = None
    owner_username: Optional[str] = None
    times_purchased: int
    last_purchased_at: datetime
    available: bool
    current_price: Optional[Decimal] = None
    current_stock: Optional[Decimal] = None
    current_unit: Optional[str] = None


class RecommendedProduct(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    owner_id: int
    owner_username: Optional[str] = None
    price: Decimal
    unit: str
    reason: str


class PersonalizedSuggestions(BaseModel):
    usually_buys: list[str]
    recommended: Optional[RecommendedProduct] = None