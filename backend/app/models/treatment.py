import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class TreatmentType(str, enum.Enum):
    DEWORMING = "DEWORMING"
    VACCINATION = "VACCINATION"
    ANTIBIOTIC = "ANTIBIOTIC"
    OTHER = "OTHER"


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    livestock_id = Column(UUID(as_uuid=True), ForeignKey("livestock.id"), nullable=False)
    medicine_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=True)
    treatment_type = Column(Enum(TreatmentType), nullable=False)
    diagnosis = Column(String, nullable=True)
    dosage_quantity = Column(Numeric(12, 2), nullable=True)
    dosage_unit = Column(String, nullable=True)
    treatment_date = Column(Date, nullable=False)
    follow_up_date = Column(Date, nullable=True)
    veterinarian = Column(String, nullable=True)
    cost = Column(Numeric(12, 2), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
