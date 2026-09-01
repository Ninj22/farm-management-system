import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class SaleItemType(str, enum.Enum):
    LIVESTOCK = "LIVESTOCK"
    PRODUCT = "PRODUCT"


class PaymentStatus(str, enum.Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    UNPAID = "UNPAID"


class Sale(Base):
    __tablename__ = "sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)
    sale_date = Column(Date, nullable=False)
    payment_status = Column(Enum(PaymentStatus, name="sale_payment_status"), nullable=False, default=PaymentStatus.UNPAID)
    payment_method = Column(String, nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("SaleItem", back_populates="sale")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id"), nullable=False)
    item_type = Column(Enum(SaleItemType), nullable=False)
    livestock_id = Column(UUID(as_uuid=True), ForeignKey("livestock.id"), nullable=True)
    inventory_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=True)
    quantity = Column(Numeric(12, 2), nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")
