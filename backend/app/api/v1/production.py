import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission
from app.models.user import User
from app.schemas.production import ProductionCreate, ProductionOut
from app.services import production_service
from app.repositories import production_repository

router = APIRouter()


@router.get("", response_model=list[ProductionOut], dependencies=[Depends(get_current_user)])
def list_production(
    farm_id: uuid.UUID | None = None,
    livestock_id: uuid.UUID | None = None,
    product_type: str | None = None,
    db: Session = Depends(get_db),
):
    return production_repository.list_production(db, farm_id, livestock_id, product_type)


@router.post("", response_model=ProductionOut, dependencies=[Depends(require_permission("production.create"))])
def record_production(payload: ProductionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return production_service.record_production(db, payload, current_user.id)
