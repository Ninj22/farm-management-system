import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.treatment import TreatmentCreate, TreatmentOut
from app.services import veterinary_service
from app.repositories import treatment_repository

router = APIRouter()
WRITE_ROLES = [UserRole.ADMIN, UserRole.FARM_MANAGER, UserRole.VETERINARY_STAFF]


@router.post("", response_model=TreatmentOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def record_treatment(payload: TreatmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return veterinary_service.record_treatment(db, payload, current_user.id)



@router.get("/by-livestock/{livestock_id}", response_model=list[TreatmentOut], dependencies=[Depends(get_current_user)])
def treatment_history(livestock_id: uuid.UUID, db: Session = Depends(get_db)):
    return treatment_repository.list_by_livestock(db, livestock_id)


@router.get("/upcoming", response_model=list[TreatmentOut], dependencies=[Depends(get_current_user)])
def upcoming_follow_ups(db: Session = Depends(get_db)):
    return treatment_repository.upcoming_follow_ups(db)
