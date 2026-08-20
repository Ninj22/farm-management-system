from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.sale import SaleCreate, SaleOut
from app.services import sale_service
from app.repositories import sale_repository

router = APIRouter()
WRITE_ROLES = [UserRole.ADMIN, UserRole.FARM_MANAGER, UserRole.SALES_STAFF]


@router.get("", response_model=list[SaleOut], dependencies=[Depends(get_current_user)])
def list_sales(skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = sale_repository.list_sales(db, skip, limit)
    return items


@router.post("", response_model=SaleOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def create_sale(payload: SaleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return sale_service.create_sale(db, payload, created_by=current_user.id)
