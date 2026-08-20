import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.inventory import InventoryCategory, StockTransactionType


class InventoryItemCreate(BaseModel):
    store_id: uuid.UUID
    name: str
    category: InventoryCategory
    unit: str
    quantity_on_hand: Decimal = Decimal("0")
    reorder_level: Decimal = Decimal("0")
    purchase_price: Decimal = Decimal("0")
    selling_price: Optional[Decimal] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    reorder_level: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None


class InventoryItemOut(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    name: str
    category: InventoryCategory
    unit: str
    quantity_on_hand: Decimal
    reorder_level: Decimal
    purchase_price: Decimal
    selling_price: Optional[Decimal]
    expiry_date: Optional[date]
    created_at: datetime
    model_config = {"from_attributes": True}


class StockTransactionCreate(BaseModel):
    quantity: Decimal
    transaction_type: StockTransactionType
    reference_type: Optional[str] = None
    reference_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None