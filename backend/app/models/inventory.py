import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class InventoryCategory(str, enum.Enum):
    ANIMAL_FEED = "ANIMAL_FEED"
    SEEDS = "SEEDS"
    FERTILIZERS = "FERTILIZERS"
    PESTICIDES = "PESTICIDES"
    VETERINARY_MEDICINE = "VETERINARY_MEDICINE"
    DEWORMERS = "DEWORMERS"
    ANTIBIOTICS = "ANTIBIOTICS"
    VACCINES = "VACCINES"
    FUEL = "FUEL"
    TOOLS = "TOOLS"
    CONSUMABLES = "CONSUMABLES"
    OTHER = "OTHER"


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(Enum(InventoryCategory), nullable=False)
    unit = Column(String, nullable=False)
    quantity_on_hand = Column(Numeric(12, 2), nullable=False, default=0)   # cached balance — always derivable from StockTransaction sum
    reorder_level = Column(Numeric(12, 2), nullable=False, default=0)
    purchase_price = Column(Numeric(12, 2), nullable=False, default=0)
    selling_price = Column(Numeric(12, 2), nullable=True)
    batch_number = Column(String, nullable=True)
    expiry_date = Column(Date, nullable=True)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("StockTransaction", back_populates="item")


class StockTransactionType(str, enum.Enum):
    OPENING_BALANCE = "OPENING_BALANCE"
    PURCHASE = "PURCHASE"
    CONSUMPTION = "CONSUMPTION"
    SALE = "SALE"
    TRANSFER = "TRANSFER"
    ADJUSTMENT = "ADJUSTMENT"
    DAMAGE = "DAMAGE"
    EXPIRY = "EXPIRY"
    RETURN = "RETURN"


class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    transaction_type = Column(Enum(StockTransactionType), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)          # SIGNED: +in, -out
    reference_type = Column(String, nullable=True)             # e.g. "purchase", "treatment", "sale"
    reference_id = Column(UUID(as_uuid=True), nullable=True)   # id of the purchase/treatment/sale row
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("InventoryItem", back_populates="transactions")