import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, InventoryItemOut, StockTransactionCreate
from app.services import inventory_service
from app.repositories import inventory_repository

router = APIRouter()
WRITE_ROLES = [UserRole.ADMIN, UserRole.FARM_MANAGER, UserRole.INVENTORY_STAFF]


@router.get("", response_model=list[InventoryItemOut], dependencies=[Depends(get_current_user)])
def list_items(store_id: uuid.UUID | None = None, search: str | None = None, skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = inventory_repository.list_items(db, store_id, search, skip, limit)
    return items


@router.get("/low-stock", response_model=list[InventoryItemOut], dependencies=[Depends(get_current_user)])
def low_stock(db: Session = Depends(get_db)):
    return inventory_repository.low_stock_items(db)


@router.post("", response_model=InventoryItemOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def create_item(payload: InventoryItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return inventory_service.create_item(db, payload, current_user.id)


@router.patch("/{item_id}", response_model=InventoryItemOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def update_item(item_id: uuid.UUID, payload: InventoryItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return inventory_service.update_item(db, item_id, payload, current_user.id)


@router.post("/{item_id}/transactions", response_model=InventoryItemOut, dependencies=[Depends(require_roles(WRITE_ROLES))])
def record_transaction(item_id: uuid.UUID, payload: StockTransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return inventory_service.record_transaction(db, item_id, payload, current_user.id)