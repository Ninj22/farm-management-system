import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.treatment import TreatmentType


class TreatmentCreate(BaseModel):
    livestock_id: uuid.UUID
    medicine_item_id: Optional[uuid.UUID] = None
    treatment_type: TreatmentType
    diagnosis: Optional[str] = None
    dosage_quantity: Optional[Decimal] = None
    dosage_unit: Optional[str] = None
    treatment_date: date
    follow_up_date: Optional[date] = None
    veterinarian: Optional[str] = None
    cost: Optional[Decimal] = None
    notes: Optional[str] = None


class TreatmentOut(BaseModel):
    id: uuid.UUID
    livestock_id: uuid.UUID
    medicine_item_id: Optional[uuid.UUID]
    treatment_type: TreatmentType
    diagnosis: Optional[str]
    treatment_date: date
    follow_up_date: Optional[date]
    veterinarian: Optional[str]
    cost: Optional[Decimal]
    created_at: datetime
    model_config = {"from_attributes": True}
