from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from decimal import Decimal
import math

from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.stock_history import StockHistory, StockChangeReason

STORE_TIMEZONE = ZoneInfo("Asia/Manila")
DAYS_IN_WEEK = 7
HOURS_IN_DAY = 24

REORDER_LOOKBACK_DAYS = 30    # window used to compute average daily sales
REORDER_COVER_DAYS = 14       # how many days of stock a suggested reorder should cover
STOCKOUT_URGENCY_DAYS = 7     # only surface products expected to run out within this window
SLOW_MOVING_WINDOW_DAYS = 30  # "unsold for" window
NEW_PRODUCT_GRACE_DAYS = 7    # don't flag a product as slow-moving days after it's listed

def get_sales_heatmap(db: Session, owner_id: int, weeks: int = 12) -> list[dict]:
    """Revenue aggregated by day-of-week and hour-of-day (store-local time),
    over a rolling window, so an owner can see at a glance which days and
    times are busiest — not just which days had the most total revenue."""
    since = datetime.now(timezone.utc) - timedelta(weeks=weeks)
    orders = _completed_orders(db, owner_id, since)

    buckets: dict[tuple[int, int], dict] = {}
    for order in orders:
        # updated_at is stored as naive UTC (SQLite drops tzinfo on write).
        local_dt = order.updated_at.replace(tzinfo=timezone.utc).astimezone(STORE_TIMEZONE)
        key = (local_dt.weekday(), local_dt.hour)
        bucket = buckets.setdefault(
            key,
            {"day_of_week": key[0], "hour": key[1], "revenue": Decimal("0"), "order_count": 0},
        )
        bucket["revenue"] += order.total
        bucket["order_count"] += 1

    # Zero-fill every day/hour cell — same principle as get_daily_sales,
    # so an empty cell reads as "no sales" rather than "no data collected".
    return [
        buckets.get(
            (dow, hour),
            {"day_of_week": dow, "hour": hour, "revenue": Decimal("0"), "order_count": 0},
        )
        for dow in range(DAYS_IN_WEEK)
        for hour in range(HOURS_IN_DAY)
    ]


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

def get_restock_suggestions(db: Session, owner_id: int) -> list[dict]:
    """Products likely to run out soon, based on recent sale velocity —
    only ones needing action within STOCKOUT_URGENCY_DAYS, so this stays a
    short, actionable list rather than a rundown of the whole catalog."""
    products = db.query(Product).filter(Product.owner_id == owner_id).all()
    if not products:
        return []

    since = datetime.now(timezone.utc) - timedelta(days=REORDER_LOOKBACK_DAYS)
    sales = (
        db.query(StockHistory)
        .filter(
            StockHistory.owner_id == owner_id,
            StockHistory.reason == StockChangeReason.SALE,
            StockHistory.created_at >= since,
            StockHistory.product_id.isnot(None),
        )
        .all()
    )

    sold_by_product: dict[int, int] = {}
    for entry in sales:
        sold_by_product[entry.product_id] = sold_by_product.get(entry.product_id, 0) + abs(entry.change)

    suggestions = []
    for product in products:
        total_sold = sold_by_product.get(product.id, 0)
        avg_daily_sales = total_sold / REORDER_LOOKBACK_DAYS
        if avg_daily_sales <= 0:
            continue  # not selling — nothing meaningful to project

        days_until_stockout = product.stock / avg_daily_sales
        if days_until_stockout > STOCKOUT_URGENCY_DAYS:
            continue  # not urgent yet

        suggested_reorder = max(0, math.ceil(avg_daily_sales * REORDER_COVER_DAYS) - product.stock)

        suggestions.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_image": product.image,
            "current_stock": product.stock,
            "avg_daily_sales": round(avg_daily_sales, 1),
            "days_until_stockout": round(days_until_stockout, 1),
            "suggested_reorder": suggested_reorder,
        })

    suggestions.sort(key=lambda s: s["days_until_stockout"])
    return suggestions


def get_slow_moving_products(db: Session, owner_id: int) -> list[dict]:
    """Products with no sale in the last SLOW_MOVING_WINDOW_DAYS. Products
    listed more recently than NEW_PRODUCT_GRACE_DAYS are excluded — a brand
    new item hasn't had a fair chance to sell yet."""
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=SLOW_MOVING_WINDOW_DAYS)
    grace_cutoff = now - timedelta(days=NEW_PRODUCT_GRACE_DAYS)

    products = (
        db.query(Product)
        .filter(Product.owner_id == owner_id, Product.created_at <= grace_cutoff)
        .all()
    )
    if not products:
        return []

    recently_sold_ids = {
        row[0]
        for row in db.query(StockHistory.product_id)
        .filter(
            StockHistory.owner_id == owner_id,
            StockHistory.reason == StockChangeReason.SALE,
            StockHistory.created_at >= since,
            StockHistory.product_id.isnot(None),
        )
        .distinct()
        .all()
    }

    # Last-ever sale per product (even outside the window), so the UI can
    # say "last sold N days ago" instead of just "not recently."
    last_sale_by_product = dict(
        db.query(StockHistory.product_id, func.max(StockHistory.created_at))
        .filter(
            StockHistory.owner_id == owner_id,
            StockHistory.reason == StockChangeReason.SALE,
            StockHistory.product_id.isnot(None),
        )
        .group_by(StockHistory.product_id)
        .all()
    )

    slow_moving = []
    for product in products:
        if product.id in recently_sold_ids:
            continue
        last_sale = last_sale_by_product.get(product.id)
        days_since_last_sale = (
            (now - last_sale.replace(tzinfo=timezone.utc)).days if last_sale else None
        )
        slow_moving.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_image": product.image,
            "current_stock": product.stock,
            "days_since_last_sale": days_since_last_sale,
        })

    # Never-sold products (None) surface first, then longest-idle first.
    slow_moving.sort(key=lambda p: p["days_since_last_sale"] if p["days_since_last_sale"] is not None else math.inf, reverse=True)
    return slow_moving


def get_fastest_selling(db: Session, owner_id: int, days: int = 30, limit: int = 5) -> list[dict]:
    """Top products by units sold over a rolling window — a "velocity"
    view distinct from the all-time Best Sellers on the Analytics page."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    sales = (
        db.query(StockHistory)
        .filter(
            StockHistory.owner_id == owner_id,
            StockHistory.reason == StockChangeReason.SALE,
            StockHistory.created_at >= since,
        )
        .all()
    )

    aggregates: dict[str, dict] = {}
    for entry in sales:
        item = aggregates.setdefault(
            entry.product_name,
            {"product_name": entry.product_name, "product_id": entry.product_id, "quantity_sold": 0},
        )
        item["quantity_sold"] += abs(entry.change)

    ranked = sorted(aggregates.values(), key=lambda e: e["quantity_sold"], reverse=True)[:limit]
    for rank, item in enumerate(ranked, start=1):
        item["rank"] = rank
    return ranked