from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.schemas.dashboard import DashboardSummary
from app.repositories import livestock_repository, inventory_repository, treatment_repository

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary, dependencies=[Depends(get_current_user)])
def get_summary(db: Session = Depends(get_db)):
    return DashboardSummary(
        total_livestock=livestock_repository.count_active(db),
        low_stock_count=len(inventory_repository.low_stock_items(db)),
        upcoming_treatments_count=len(treatment_repository.upcoming_follow_ups(db)),
        inventory_value=inventory_repository.total_inventory_value(db),
    )
