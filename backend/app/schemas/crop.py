import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.crop import CropStatus, CropActivityType


class FieldCreate(BaseModel):
    farm_id: uuid.UUID
    name: str
    size: Optional[Decimal] = None
    size_unit: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class FieldOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    name: str
    size: Optional[Decimal]
    size_unit: Optional[str]
    location: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class CropCreate(BaseModel):
    field_id: uuid.UUID
    crop_type: str
    variety: Optional[str] = None
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    quantity_planted: Optional[Decimal] = None
    planting_unit: Optional[str] = None


class CropUpdate(BaseModel):
    status: Optional[CropStatus] = None


class CropOut(BaseModel):
    id: uuid.UUID
    field_id: uuid.UUID
    crop_type: str
    variety: Optional[str]
    planting_date: Optional[date]
    expected_harvest_date: Optional[date]
    status: CropStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class CropActivityCreate(BaseModel):
    activity_type: CropActivityType
    activity_date: date
    input_item_id: Optional[uuid.UUID] = None
    quantity_used: Optional[Decimal] = None
    cost: Optional[Decimal] = None
    notes: Optional[str] = None


class CropActivityOut(BaseModel):
    id: uuid.UUID
    crop_id: uuid.UUID
    activity_type: CropActivityType
    activity_date: date
    quantity_used: Optional[Decimal]
    cost: Optional[Decimal]
    notes: Optional[str]

    model_config = {"from_attributes": True}


class HarvestCreate(BaseModel):
    harvest_date: date
    quantity: Decimal
    unit: str
    produce_inventory_item_id: Optional[uuid.UUID] = None  # if set, adds this harvest to that item's stock
    notes: Optional[str] = None


class HarvestOut(BaseModel):
    id: uuid.UUID
    crop_id: uuid.UUID
    harvest_date: date
    quantity: Decimal
    unit: str
    produce_inventory_item_id: Optional[uuid.UUID]
    notes: Optional[str]

    model_config = {"from_attributes": True}
