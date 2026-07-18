from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    order_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=500)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    customer_id: int
    customer_username: Optional[str] = None
    order_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
