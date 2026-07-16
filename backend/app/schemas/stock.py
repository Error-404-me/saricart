from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.stock_history import StockChangeReason


class StockAdjustment(BaseModel):
    delta: int = Field(description="Positive to add stock, negative to remove it.")


class StockHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: Optional[int] = None
    product_name: str
    change: int
    reason: StockChangeReason
    previous_stock: int
    new_stock: int
    created_at: datetime
