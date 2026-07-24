from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.customer import FavoriteStoreOut, ReorderableItem, PersonalizedSuggestions
from app.services import customer_service

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("/favorites", response_model=list[FavoriteStoreOut])
def list_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return customer_service.list_favorite_stores(db, current_user.id)


@router.post("/favorites/{store_id}", response_model=FavoriteStoreOut, status_code=201)
def add_favorite(
    store_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return customer_service.add_favorite(db, current_user.id, store_id)


@router.delete("/favorites/{store_id}", status_code=204)
def remove_favorite(
    store_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    customer_service.remove_favorite(db, current_user.id, store_id)


@router.get("/recently-bought", response_model=list[ReorderableItem])
def recently_bought(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return customer_service.get_recently_bought(db, current_user.id)


@router.get("/buy-again", response_model=list[ReorderableItem])
def buy_again(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return customer_service.get_buy_again(db, current_user.id)


@router.get("/suggestions", response_model=PersonalizedSuggestions)
def suggestions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return customer_service.get_personalized_suggestions(db, current_user.id)