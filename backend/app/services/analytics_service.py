from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderStatus


def _completed_orders(db: Session, owner_id: int, since: datetime | None = None) -> list[Order]:
    query = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.owner_id == owner_id, Order.status == OrderStatus.COMPLETED)
    )
    if since:
        query = query.filter(Order.updated_at >= since)
    return query.all()


def get_summary(db: Session, owner_id: int) -> dict:
    orders = _completed_orders(db, owner_id)
    total_revenue = sum((o.total for o in orders), Decimal("0"))
    total_orders = len(orders)
    total_items_sold = sum(item.quantity for o in orders for item in o.items)
    average_order_value = (total_revenue / total_orders) if total_orders else Decimal("0")

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_items_sold": total_items_sold,
        "average_order_value": average_order_value,
    }


def get_daily_sales(db: Session, owner_id: int, days: int = 30) -> list[dict]:
    today = datetime.now(timezone.utc).date()
    since = datetime.combine(today - timedelta(days=days - 1), datetime.min.time()).replace(
        tzinfo=timezone.utc
    )
    orders = _completed_orders(db, owner_id, since)

    buckets: dict[str, dict] = {}
    for order in orders:
        key = order.updated_at.date().isoformat()
        bucket = buckets.setdefault(key, {"date": key, "revenue": Decimal("0"), "order_count": 0})
        bucket["revenue"] += order.total
        bucket["order_count"] += 1

    # Fill in every day in the window (even zero-sale days) so a chart never
    # has gaps that could be misread as missing data.
    return [
        buckets.get(
            (today - timedelta(days=i)).isoformat(),
            {"date": (today - timedelta(days=i)).isoformat(), "revenue": Decimal("0"), "order_count": 0},
        )
        for i in range(days - 1, -1, -1)
    ]


def _month_key(dt: datetime) -> str:
    return f"{dt.year:04d}-{dt.month:02d}"


def _recent_month_keys(months: int) -> list[str]:
    now = datetime.now(timezone.utc)
    year, month = now.year, now.month
    keys = []
    for _ in range(months):
        keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(keys))


def get_monthly_sales(db: Session, owner_id: int, months: int = 12) -> list[dict]:
    month_keys = _recent_month_keys(months)
    since = datetime.strptime(f"{month_keys[0]}-01", "%Y-%m-%d").replace(tzinfo=timezone.utc)
    orders = _completed_orders(db, owner_id, since)

    buckets: dict[str, dict] = {}
    for order in orders:
        key = _month_key(order.updated_at)
        bucket = buckets.setdefault(key, {"month": key, "revenue": Decimal("0"), "order_count": 0})
        bucket["revenue"] += order.total
        bucket["order_count"] += 1

    return [
        buckets.get(key, {"month": key, "revenue": Decimal("0"), "order_count": 0})
        for key in month_keys
    ]


def get_best_sellers(db: Session, owner_id: int, limit: int = 10) -> list[dict]:
    orders = _completed_orders(db, owner_id)

    # Grouped by the item's snapshot name (stable even if the underlying
    # product was later edited or deleted) rather than product_id.
    aggregates: dict[str, dict] = {}
    for order in orders:
        for item in order.items:
            entry = aggregates.setdefault(
                item.product_name,
                {
                    "product_name": item.product_name,
                    "product_image": item.product_image,
                    "quantity_sold": 0,
                    "revenue": Decimal("0"),
                },
            )
            entry["quantity_sold"] += item.quantity
            entry["revenue"] += item.price * item.quantity

    return sorted(aggregates.values(), key=lambda e: e["quantity_sold"], reverse=True)[:limit]
