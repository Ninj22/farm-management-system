import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.store import Store
from app.schemas.store import StoreCreate, StoreOut
from app.repositories import store_repository

router = APIRouter()


@router.get("", response_model=list[StoreOut], dependencies=[Depends(get_current_user)])
def list_stores(farm_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    return store_repository.list_stores(db, farm_id)


@router.post("", response_model=StoreOut, dependencies=[Depends(require_roles([UserRole.ADMIN, UserRole.FARM_MANAGER]))])
def create_store(payload: StoreCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.core.scoping import assert_farm_access
    assert_farm_access(db, current_user, payload.farm_id)
    store = Store(**payload.model_dump())
    return store_repository.create_store(db, store)