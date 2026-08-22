import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission
from app.models.user import User
from app.schemas.equipment import (
    EquipmentCreate, EquipmentUpdate, EquipmentOut, MaintenanceRecordCreate, MaintenanceRecordOut,
)
from app.services import equipment_service
from app.repositories import equipment_repository

router = APIRouter()
@router.get("", response_model=list[EquipmentOut], dependencies=[Depends(get_current_user)])
def list_equipment(search: str | None = None, skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = equipment_repository.list_equipment(db, search, skip, limit)
    return items


@router.get("/upcoming-service", response_model=list[MaintenanceRecordOut], dependencies=[Depends(get_current_user)])
def upcoming_service(db: Session = Depends(get_db)):
    return equipment_repository.upcoming_service(db)


@router.post("", response_model=EquipmentOut, dependencies=[Depends(require_permission("equipment.create"))])
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return equipment_service.create_equipment(db, payload, current_user.id)


@router.patch("/{equipment_id}", response_model=EquipmentOut, dependencies=[Depends(require_permission("equipment.update"))])
def update_equipment(equipment_id: uuid.UUID, payload: EquipmentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return equipment_service.update_equipment(db, equipment_id, payload, current_user.id)


@router.get("/{equipment_id}/maintenance", response_model=list[MaintenanceRecordOut], dependencies=[Depends(get_current_user)])
def maintenance_history(equipment_id: uuid.UUID, db: Session = Depends(get_db)):
    return equipment_repository.list_maintenance_records(db, equipment_id)


@router.post("/{equipment_id}/maintenance", response_model=EquipmentOut, dependencies=[Depends(require_permission("equipment.maintain"))])
def record_maintenance(equipment_id: uuid.UUID, payload: MaintenanceRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return equipment_service.record_maintenance(db, equipment_id, payload, current_user.id)
