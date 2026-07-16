from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    today_sales: Decimal
    month_sales: Decimal
    total_revenue: Decimal
    total_orders: int
    pending_orders: int


class DailySalesPoint(BaseModel):
    date: str  # "YYYY-MM-DD"
    revenue: Decimal
    order_count: int


class MonthlySalesPoint(BaseModel):
    month: str  # "YYYY-MM"
    revenue: Decimal
    order_count: int


class BestSellerOut(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    quantity_sold: int
    revenue: Decimal
