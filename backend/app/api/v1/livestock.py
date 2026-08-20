import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.livestock import LivestockCreate, LivestockUpdate, LivestockOut
from app.services import livestock_service
from app.repositories import livestock_repository

router = APIRouter()
WRITE_ROLES = [UserRole.ADMIN, UserRole.FARM_MANAGER, UserRole.VETERINARY_STAFF]


@router.get("", response_model=list[LivestockOut], dependencies=[Depends(get_current_user)])
def list_livestock(search: str | None = None, status: str | None = None, skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = livestock_repository.list_livestock(db, search, status, skip, limit)
    return items


@router.post("", response_model=LivestockOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def create_livestock(payload: LivestockCreate, db: Session = Depends(get_db)):
    return livestock_service.create_livestock(db, payload)


@router.patch("/{livestock_id}", response_model=LivestockOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def update_livestock(livestock_id: uuid.UUID, payload: LivestockUpdate, db: Session = Depends(get_db)):
    return livestock_service.update_livestock(db, livestock_id, payload)
