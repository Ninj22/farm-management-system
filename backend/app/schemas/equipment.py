import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.equipment import EquipmentStatus


class EquipmentCreate(BaseModel):
    name: str
    category: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    condition: Optional[str] = None
    location: Optional[str] = None


class EquipmentUpdate(BaseModel):
    condition: Optional[str] = None
    location: Optional[str] = None
    status: Optional[EquipmentStatus] = None


class EquipmentOut(BaseModel):
    id: uuid.UUID
    name: str
    category: Optional[str]
    serial_number: Optional[str]
    purchase_date: Optional[date]
    purchase_price: Optional[Decimal]
    condition: Optional[str]
    location: Optional[str]
    status: EquipmentStatus
    created_at: datetime
    model_config = {"from_attributes": True}


class MaintenanceRecordCreate(BaseModel):
    maintenance_date: date
    service_type: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    next_service_date: Optional[date] = None


class MaintenanceRecordOut(BaseModel):
    id: uuid.UUID
    equipment_id: uuid.UUID
    maintenance_date: date
    service_type: Optional[str]
    description: Optional[str]
    cost: Optional[Decimal]
    next_service_date: Optional[date]
    model_config = {"from_attributes": True}
