import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class PaymentStatus(str, enum.Enum):
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    UNPAID = "UNPAID"


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=False)
    invoice_number = Column(String, nullable=True)
    purchase_date = Column(Date, nullable=False)
    payment_status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.UNPAID)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("PurchaseItem", back_populates="purchase")


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_id = Column(UUID(as_uuid=True), ForeignKey("purchases.id"), nullable=False)
    item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)

    purchase = relationship("Purchase", back_populates="items")
