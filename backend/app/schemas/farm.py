import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.farm import FarmStatus


class FarmCreate(BaseModel):
    name: str
    county: Optional[str] = None
    sub_county: Optional[str] = None
    location: Optional[str] = None
    size: Optional[Decimal] = None


class FarmOut(BaseModel):
    id: uuid.UUID
    name: str
    county: Optional[str]
    location: Optional[str]
    size: Optional[Decimal]
    status: FarmStatus
    created_at: datetime
    model_config = {"from_attributes": True}


