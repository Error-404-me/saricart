from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.stock_history import StockChangeReason


class StockAdjustment(BaseModel):
    delta: Decimal = Field(
        decimal_places=4,
        description="Positive to add stock, negative to remove it.",
    )


class StockHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: Optional[int] = None
    product_name: str
    change: Decimal
    reason: StockChangeReason
    previous_stock: Decimal
    new_stock: Decimal
    created_at: datetime


class StockHistoryBulkDelete(BaseModel):
    ids: list[int] = Field(min_length=1)