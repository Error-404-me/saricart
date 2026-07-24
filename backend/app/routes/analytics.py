from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_owner
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummary,
    DailySalesPoint,
    MonthlySalesPoint,
    BestSellerItem,
    HeatmapCell,
    RestockSuggestion,
    SlowMovingProduct,
    FastestSellingItem,
)
from app.services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_summary(db, current_user.id)


@router.get("/daily-sales", response_model=list[DailySalesPoint])
def daily_sales(
    days: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_daily_sales(db, current_user.id, days)


@router.get("/monthly-sales", response_model=list[MonthlySalesPoint])
def monthly_sales(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_monthly_sales(db, current_user.id, months)


@router.get("/best-sellers", response_model=list[BestSellerItem])
def best_sellers(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_best_sellers(db, current_user.id, limit)

@router.get("/heatmap", response_model=list[HeatmapCell])
def sales_heatmap(
    weeks: int = 12,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_sales_heatmap(db, current_user.id, weeks)

@router.get("/restock-suggestions", response_model=list[RestockSuggestion])
def restock_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_restock_suggestions(db, current_user.id)


@router.get("/slow-moving", response_model=list[SlowMovingProduct])
def slow_moving_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_slow_moving_products(db, current_user.id)


@router.get("/fastest-selling", response_model=list[FastestSellingItem])
def fastest_selling(
    days: int = 30,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_fastest_selling(db, current_user.id, days, limit)
