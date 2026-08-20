import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SupplierCreate(BaseModel):
    name: str
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None


class SupplierOut(BaseModel):
    id: uuid.UUID
    name: str
    contact_phone: Optional[str]
    contact_email: Optional[str]
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
