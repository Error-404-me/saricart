from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.product import ProductUnit


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=80)
    price: Decimal = Field(gt=0, decimal_places=2)
    unit: ProductUnit = Field(default=ProductUnit.PIECE)
    stock: Decimal = Field(ge=0, decimal_places=3, default=Decimal("0"))
    barcode: Optional[str] = Field(default=None, max_length=64)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=80)
    price: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    unit: Optional[ProductUnit] = None
    stock: Optional[Decimal] = Field(default=None, ge=0, decimal_places=3)
    barcode: Optional[str] = Field(default=None, max_length=64)


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    owner_username: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime