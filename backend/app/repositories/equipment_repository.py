import uuid
from sqlalchemy.orm import Session

from app.models.equipment import Equipment, MaintenanceRecord


def list_equipment(db: Session, search: str | None, skip: int, limit: int):
    query = db.query(Equipment)
    if search:
        query = query.filter(Equipment.name.ilike(f"%{search}%"))
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def get_equipment(db: Session, equipment_id: uuid.UUID) -> Equipment | None:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def create_equipment(db: Session, equipment: Equipment) -> Equipment:
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


def save(db: Session, equipment: Equipment) -> Equipment:
    db.commit()
    db.refresh(equipment)
    return equipment


def add_maintenance_record(db: Session, record: MaintenanceRecord) -> MaintenanceRecord:
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_maintenance_records(db: Session, equipment_id: uuid.UUID):
    return db.query(MaintenanceRecord).filter(
        MaintenanceRecord.equipment_id == equipment_id
    ).order_by(MaintenanceRecord.maintenance_date.desc()).all()


def upcoming_service(db: Session, within_days: int = 30):
    from datetime import date, timedelta
    cutoff = date.today() + timedelta(days=within_days)
    return db.query(MaintenanceRecord).filter(
        MaintenanceRecord.next_service_date.isnot(None),
        MaintenanceRecord.next_service_date <= cutoff,
        MaintenanceRecord.next_service_date >= date.today(),
    ).order_by(MaintenanceRecord.next_service_date.asc()).all()
