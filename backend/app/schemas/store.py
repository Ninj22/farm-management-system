import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class StoreCreate(BaseModel):
    farm_id: uuid.UUID
    name: str
    location: Optional[str] = None


class StoreOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    name: str
    location: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}