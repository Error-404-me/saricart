from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_revenue: Decimal
    total_orders: int
    total_items_sold: float
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
    quantity_sold: float
    revenue: Decimal


class HeatmapCell(BaseModel):
    day_of_week: int
    hour: int
    revenue: Decimal
    order_count: int


class RestockSuggestion(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    current_stock: float
    avg_daily_sales: float
    days_until_stockout: float
    suggested_reorder: float


class SlowMovingProduct(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    current_stock: float
    days_since_last_sale: Optional[int] = None


class FastestSellingItem(BaseModel):
    rank: int
    product_id: Optional[int] = None
    product_name: str
    quantity_sold: float