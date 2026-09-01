import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ProductionCreate(BaseModel):
    farm_id: uuid.UUID
    livestock_id: Optional[uuid.UUID] = None
    product_type: str
    quantity: Decimal
    unit: str
    production_date: date
    produce_inventory_item_id: Optional[uuid.UUID] = None  # if set, adds this production to that item's stock
    notes: Optional[str] = None


class ProductionOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    livestock_id: Optional[uuid.UUID]
    product_type: str
    quantity: Decimal
    unit: str
    production_date: date
    produce_inventory_item_id: Optional[uuid.UUID]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
