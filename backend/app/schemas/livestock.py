import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.livestock import Sex, LivestockStatus


class LivestockCreate(BaseModel):
    tag_number: str
    species: str = "Cattle"
    breed: Optional[str] = None
    sex: Sex
    date_of_birth: Optional[date] = None
    acquisition_date: Optional[date] = None
    source: Optional[str] = None
    location: Optional[str] = None
    dam_id: Optional[uuid.UUID] = None
    sire_id: Optional[uuid.UUID] = None


class LivestockUpdate(BaseModel):
    breed: Optional[str] = None
    location: Optional[str] = None
    status: Optional[LivestockStatus] = None


class LivestockOut(BaseModel):
    id: uuid.UUID
    tag_number: str
    species: str
    breed: Optional[str]
    sex: Sex
    date_of_birth: Optional[date]
    status: LivestockStatus
    location: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}
