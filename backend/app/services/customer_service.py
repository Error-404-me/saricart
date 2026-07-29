from collections import Counter

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.favorite import Favorite
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.store import Store
from app.services import store_service


# ---------- Favorites ----------

def _serialize_favorite(db: Session, favorite: Favorite, store: Store) -> dict:
    store = store_service._attach_display_fields(db, store)
    return {
        "id": favorite.id,
        "store_id": store.id,
        "store_name": store.name,
        "owner_id": store.owner_id,
        "status": store.status,
        "rating_average": store.rating_average,
        "rating_count": store.rating_count,
        "latitude": store.latitude,
        "longitude": store.longitude,
        "favorited_at": favorite.created_at,
    }


def list_favorite_stores(db: Session, customer_id: int) -> list[dict]:
    favorites = (
        db.query(Favorite)
        .options(joinedload(Favorite.store))
        .filter(Favorite.customer_id == customer_id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [_serialize_favorite(db, fav, fav.store) for fav in favorites if fav.store]


def add_favorite(db: Session, customer_id: int, store_id: int) -> dict:
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found.")

    favorite = (
        db.query(Favorite)
        .filter(Favorite.customer_id == customer_id, Favorite.store_id == store_id)
        .first()
    )
    if not favorite:
        favorite = Favorite(customer_id=customer_id, store_id=store_id)
        db.add(favorite)
        db.commit()
        db.refresh(favorite)

    return _serialize_favorite(db, favorite, store)


def remove_favorite(db: Session, customer_id: int, store_id: int) -> None:
    db.query(Favorite).filter(
        Favorite.customer_id == customer_id, Favorite.store_id == store_id
    ).delete()
    db.commit()


# ---------- Purchase history helpers ----------

def _customer_order_items(db: Session, customer_id: int):
    """(OrderItem, ordered_at) pairs from completed orders, newest first."""
    return (
        db.query(OrderItem, Order.updated_at)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.customer_id == customer_id, Order.status == OrderStatus.COMPLETED)
        .order_by(Order.updated_at.desc())
        .all()
    )


def _attach_live_details(db: Session, entries: list[dict]) -> list[dict]:
    product_ids = [e["product_id"] for e in entries if e["product_id"]]
    products_by_id = (
        {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}
        if product_ids
        else {}
    )
    results = []
    for entry in entries:
        product = products_by_id.get(entry["product_id"]) if entry["product_id"] else None
        results.append({
            **entry,
            "owner_id": product.owner_id if product else None,
            "owner_username": product.owner_username if product else None,
            "available": bool(product and product.stock > 0),
            "current_price": product.price if product else None,
            "current_stock": product.stock if product else None,
            "current_unit": product.unit.value if product else None,
        })
    return results


# ---------- Recently Bought (one-click reorder) ----------

def get_recently_bought(db: Session, customer_id: int, limit: int = 10) -> list[dict]:
    rows = _customer_order_items(db, customer_id)
    seen: dict[str, dict] = {}
    for item, ordered_at in rows:
        key = f"p:{item.product_id}" if item.product_id else f"n:{item.product_name}"
        if key in seen:
            continue
        seen[key] = {
            "product_id": item.product_id,
            "product_name": item.product_name,
            "product_image": item.product_image,
            "times_purchased": 1,
            "last_purchased_at": ordered_at,
        }
        if len(seen) >= limit:
            break
    return _attach_live_details(db, list(seen.values()))


# ---------- Buy Again (repeat purchases) ----------

def get_buy_again(db: Session, customer_id: int, limit: int = 12) -> list[dict]:
    rows = _customer_order_items(db, customer_id)
    grouped: dict[str, dict] = {}
    for item, ordered_at in rows:
        key = f"p:{item.product_id}" if item.product_id else f"n:{item.product_name}"
        entry = grouped.setdefault(key, {
            "product_id": item.product_id,
            "product_name": item.product_name,
            "product_image": item.product_image,
            "times_purchased": 0,
            "last_purchased_at": ordered_at,
        })
        entry["times_purchased"] += 1
        if ordered_at > entry["last_purchased_at"]:
            entry["last_purchased_at"] = ordered_at

    # Only products bought more than once count as a "buy again" habit —
    # a single one-off purchase isn't a pattern worth resurfacing.
    frequent = [e for e in grouped.values() if e["times_purchased"] >= 2]
    frequent.sort(key=lambda e: (e["times_purchased"], e["last_purchased_at"]), reverse=True)
    return _attach_live_details(db, frequent[:limit])


# ---------- Personalized Suggestions ----------

def get_personalized_suggestions(db: Session, customer_id: int) -> dict:
    """"Usually buys" = top 3 most-purchased product names. "Recommended"
    = one unpurchased product sharing a category with something the
    customer buys often, from a store they've already bought from — kept
    simple and explainable rather than a black-box model."""
    rows = _customer_order_items(db, customer_id)
    if not rows:
        return {"usually_buys": [], "recommended": None}

    name_counts = Counter(item.product_name for item, _ in rows)
    usually_buys = [name for name, _ in name_counts.most_common(3)]

    purchased_product_ids = {item.product_id for item, _ in rows if item.product_id}
    owner_ids = {item.order.owner_id for item, _ in rows if item.order}

    bought_products = (
        db.query(Product).filter(Product.id.in_(purchased_product_ids)).all()
        if purchased_product_ids
        else []
    )
    category_counts = Counter(p.category for p in bought_products if p.category)

    recommended = None
    for category, _ in category_counts.most_common():
        candidate_query = db.query(Product).filter(
            Product.category == category,
            Product.stock > 0,
        )
        if owner_ids:
            candidate_query = candidate_query.filter(Product.owner_id.in_(owner_ids))
        if purchased_product_ids:
            candidate_query = candidate_query.filter(~Product.id.in_(purchased_product_ids))

        candidate = candidate_query.order_by(Product.created_at.desc()).first()
        if candidate:
            recommended = {
                "product_id": candidate.id,
                "product_name": candidate.name,
                "product_image": candidate.image,
                "owner_id": candidate.owner_id,
                "owner_username": candidate.owner_username,
                "price": candidate.price,
                "unit": candidate.unit,
                "reason": f"Because you often buy {category.lower()}",
            }
            break

    return {"usually_buys": usually_buys, "recommended": recommended}