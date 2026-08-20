from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, FarmOut
from app.repositories import farm_repository

router = APIRouter()


@router.get("", response_model=list[FarmOut], dependencies=[Depends(get_current_user)])
def list_farms(db: Session = Depends(get_db)):
    return farm_repository.list_farms(db)


@router.post("", response_model=FarmOut, dependencies=[Depends(require_roles([UserRole.ADMIN]))])
def create_farm(payload: FarmCreate, db: Session = Depends(get_db)):
    farm = Farm(**payload.model_dump())
    return farm_repository.create_farm(db, farm)
