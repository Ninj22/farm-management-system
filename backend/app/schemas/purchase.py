import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.purchase import PaymentStatus


class PurchaseItemCreate(BaseModel):
    item_id: uuid.UUID
    quantity: Decimal
    unit_price: Decimal


class PurchaseCreate(BaseModel):
    supplier_id: uuid.UUID
    invoice_number: Optional[str] = None
    purchase_date: date
    payment_status: PaymentStatus = PaymentStatus.UNPAID
    items: list[PurchaseItemCreate]


class PurchaseItemOut(BaseModel):
    item_id: uuid.UUID
    quantity: Decimal
    unit_price: Decimal
    model_config = {"from_attributes": True}


class PurchaseOut(BaseModel):
    id: uuid.UUID
    supplier_id: uuid.UUID
    invoice_number: Optional[str]
    purchase_date: date
    payment_status: PaymentStatus
    total_amount: Decimal
    created_at: datetime
    items: list[PurchaseItemOut]
    model_config = {"from_attributes": True}
