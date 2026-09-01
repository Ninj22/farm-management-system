import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.sale import SaleItemType, PaymentStatus


class SaleItemCreate(BaseModel):
    item_type: SaleItemType
    livestock_id: Optional[uuid.UUID] = None
    inventory_item_id: Optional[uuid.UUID] = None
    quantity: Decimal = Decimal("1")
    unit_price: Decimal


class SaleCreate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    sale_date: date
    payment_status: PaymentStatus = PaymentStatus.UNPAID
    payment_method: Optional[str] = None
    items: list[SaleItemCreate]


class SaleItemOut(BaseModel):
    item_type: SaleItemType
    livestock_id: Optional[uuid.UUID]
    inventory_item_id: Optional[uuid.UUID]
    quantity: Decimal
    unit_price: Decimal
    model_config = {"from_attributes": True}


class SaleOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    sale_date: date
    payment_status: PaymentStatus
    total_amount: Decimal
    created_at: datetime
    items: list[SaleItemOut]
    model_config = {"from_attributes": True}
