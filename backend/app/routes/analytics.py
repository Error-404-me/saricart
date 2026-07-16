from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_owner
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsOverview,
    BestSellerOut,
    DailySalesPoint,
    MonthlySalesPoint,
)
from app.services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_overview(db, current_user.id)


@router.get("/daily-sales", response_model=list[DailySalesPoint])
def get_daily_sales(
    days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_daily_sales(db, current_user.id, days)


@router.get("/monthly-sales", response_model=list[MonthlySalesPoint])
def get_monthly_sales(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_monthly_sales(db, current_user.id, months)


@router.get("/best-sellers", response_model=list[BestSellerOut])
def get_best_sellers(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return analytics_service.get_best_sellers(db, current_user.id, limit)
