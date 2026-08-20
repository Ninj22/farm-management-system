import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierOut
from app.services import supplier_service
from app.repositories import supplier_repository

router = APIRouter()
WRITE_ROLES = [UserRole.ADMIN, UserRole.FARM_MANAGER, UserRole.INVENTORY_STAFF]


@router.get("", response_model=list[SupplierOut], dependencies=[Depends(get_current_user)])
def list_suppliers(search: str | None = None, skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = supplier_repository.list_suppliers(db, search, skip, limit)
    return items


@router.post("", response_model=SupplierOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    return supplier_service.create_supplier(db, payload)


@router.patch("/{supplier_id}", response_model=SupplierOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def update_supplier(supplier_id: uuid.UUID, payload: SupplierUpdate, db: Session = Depends(get_db)):
    return supplier_service.update_supplier(db, supplier_id, payload)
