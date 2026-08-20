import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.equipment import Equipment, MaintenanceRecord, EquipmentStatus
from app.repositories import equipment_repository
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, MaintenanceRecordCreate
from app.core.audit import log_action


def create_equipment(db: Session, payload: EquipmentCreate, user_id: uuid.UUID) -> Equipment:
    equipment = Equipment(**payload.model_dump())
    equipment = equipment_repository.create_equipment(db, equipment)
    log_action(db, user_id, "CREATE", "Equipment", equipment.id)
    return equipment


def update_equipment(db: Session, equipment_id: uuid.UUID, payload: EquipmentUpdate, user_id: uuid.UUID) -> Equipment:
    equipment = equipment_repository.get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(equipment, field, value)
    equipment = equipment_repository.save(db, equipment)
    log_action(db, user_id, "UPDATE", "Equipment", equipment.id)
    return equipment


def record_maintenance(db: Session, equipment_id: uuid.UUID, payload: MaintenanceRecordCreate, user_id: uuid.UUID) -> Equipment:
    """Recording maintenance also flips the equipment's status — matches the spec's
    'repair completed' workflow: UNDER_MAINTENANCE while being worked on isn't tracked
    automatically here (that's a manual status update via PATCH), but every completed
    record puts it back to OPERATIONAL unless the person marks otherwise afterward."""
    equipment = equipment_repository.get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")

    record = MaintenanceRecord(equipment_id=equipment_id, **payload.model_dump())
    equipment_repository.add_maintenance_record(db, record)

    equipment.status = EquipmentStatus.OPERATIONAL
    equipment_repository.save(db, equipment)

    log_action(db, user_id, "RECORD_MAINTENANCE", "Equipment", equipment.id, changes={"cost": str(payload.cost) if payload.cost else None})
    return equipment
