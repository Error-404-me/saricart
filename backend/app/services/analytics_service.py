"""
Aggregation helpers for the owner-facing analytics dashboard (Phase 9).

"Sales" here means completed orders: revenue is only counted once an order
reaches OrderStatus.COMPLETED, and the completion date is approximated by
Order.updated_at (the timestamp that changes whenever an order's status is
updated, including the move to "completed"). That avoids adding a separate
completed_at column just for the MVP.

Grouping is done in Python rather than with DB-specific date functions
(e.g. SQLite's strftime) so this keeps working unchanged after the planned
Postgres migration mentioned in app/database.py.
"""
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem

# Everything that hasn't reached a terminal state yet.
ACTIVE_STATUSES = {
    OrderStatus.PENDING,
    OrderStatus.ACCEPTED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
}


def _completed_orders_query(db: Session, owner_id: int):
    return db.query(Order).filter(
        Order.owner_id == owner_id,
        Order.status == OrderStatus.COMPLETED,
    )


def get_overview(db: Session, owner_id: int) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today_start.replace(day=1)

    completed = _completed_orders_query(db, owner_id).all()

    today_sales = sum((o.total for o in completed if o.updated_at >= today_start), Decimal("0"))
    month_sales = sum((o.total for o in completed if o.updated_at >= month_start), Decimal("0"))
    total_revenue = sum((o.total for o in completed), Decimal("0"))

    pending_orders = (
        db.query(Order)
        .filter(Order.owner_id == owner_id, Order.status.in_(ACTIVE_STATUSES))
        .count()
    )

    return {
        "today_sales": today_sales,
        "month_sales": month_sales,
        "total_revenue": total_revenue,
        "total_orders": len(completed),
        "pending_orders": pending_orders,
    }


def get_daily_sales(db: Session, owner_id: int, days: int = 14) -> list[dict]:
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start = today - timedelta(days=days - 1)

    completed = _completed_orders_query(db, owner_id).filter(Order.updated_at >= start).all()

    buckets = defaultdict(lambda: {"revenue": Decimal("0"), "order_count": 0})
    for order in completed:
        key = order.updated_at.date().isoformat()
        buckets[key]["revenue"] += order.total
        buckets[key]["order_count"] += 1

    result = []
    for i in range(days):
        day = (start + timedelta(days=i)).date()
        key = day.isoformat()
        bucket = buckets.get(key, {"revenue": Decimal("0"), "order_count": 0})
        result.append({"date": key, "revenue": bucket["revenue"], "order_count": bucket["order_count"]})
    return result


def get_monthly_sales(db: Session, owner_id: int, months: int = 6) -> list[dict]:
    now = datetime.now(timezone.utc)

    # Walk backwards `months` calendar months from the current one.
    month_keys = []
    year, month = now.year, now.month
    for _ in range(months):
        month_keys.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    month_keys.reverse()

    earliest_year, earliest_month = month_keys[0]
    start = datetime(earliest_year, earliest_month, 1, tzinfo=timezone.utc)

    completed = _completed_orders_query(db, owner_id).filter(Order.updated_at >= start).all()

    buckets = defaultdict(lambda: {"revenue": Decimal("0"), "order_count": 0})
    for order in completed:
        key = f"{order.updated_at.year:04d}-{order.updated_at.month:02d}"
        buckets[key]["revenue"] += order.total
        buckets[key]["order_count"] += 1

    result = []
    for year, month in month_keys:
        key = f"{year:04d}-{month:02d}"
        bucket = buckets.get(key, {"revenue": Decimal("0"), "order_count": 0})
        result.append({"month": key, "revenue": bucket["revenue"], "order_count": bucket["order_count"]})
    return result


def get_best_sellers(db: Session, owner_id: int, limit: int = 5) -> list[dict]:
    # Grouped by the OrderItem's snapshotted product_name (not a live FK
    # join to Product) so best-sellers still read correctly even if a
    # product was later renamed or deleted — see OrderItem's model
    # docstring for why those fields are captured at order time.
    rows = (
        db.query(
            OrderItem.product_name,
            func.max(OrderItem.product_id).label("product_id"),
            func.max(OrderItem.product_image).label("product_image"),
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(OrderItem.quantity * OrderItem.price).label("revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.owner_id == owner_id, Order.status == OrderStatus.COMPLETED)
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "product_id": row.product_id,
            "product_name": row.product_name,
            "product_image": row.product_image,
            "quantity_sold": int(row.quantity_sold or 0),
            "revenue": row.revenue or Decimal("0"),
        }
        for row in rows
    ]
