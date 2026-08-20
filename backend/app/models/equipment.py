import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class EquipmentStatus(str, enum.Enum):
    OPERATIONAL = "OPERATIONAL"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"
    DISPOSED = "DISPOSED"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)          # e.g. "Tractor", "Sprayer", "Milking equipment"
    serial_number = Column(String, nullable=True)
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(Numeric(12, 2), nullable=True)
    condition = Column(String, nullable=True)          # free text: "Good", "Needs repair", etc.
    location = Column(String, nullable=True)
    assigned_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(Enum(EquipmentStatus), nullable=False, default=EquipmentStatus.OPERATIONAL)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    maintenance_records = relationship("MaintenanceRecord", back_populates="equipment")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=False)
    maintenance_date = Column(Date, nullable=False)
    service_type = Column(String, nullable=True)        # "Preventive", "Corrective", "Emergency repair"
    description = Column(String, nullable=True)
    cost = Column(Numeric(12, 2), nullable=True)
    next_service_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    equipment = relationship("Equipment", back_populates="maintenance_records")
