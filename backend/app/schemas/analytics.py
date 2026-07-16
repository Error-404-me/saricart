from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_revenue: Decimal
    total_orders: int
    total_items_sold: int
    average_order_value: Decimal


class DailySalesPoint(BaseModel):
    date: str
    revenue: Decimal
    order_count: int


class MonthlySalesPoint(BaseModel):
    month: str
    revenue: Decimal
    order_count: int


class BestSellerItem(BaseModel):
    product_name: str
    product_image: Optional[str] = None
    quantity_sold: int
    revenue: Decimal
