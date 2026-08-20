import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ExpenseCategory(str, enum.Enum):
    FEED = "FEED"
    VET_SERVICES = "VET_SERVICES"
    MEDICINE = "MEDICINE"
    SEEDS = "SEEDS"
    FERTILIZER = "FERTILIZER"
    LABOR = "LABOR"
    TRANSPORT = "TRANSPORT"
    EQUIPMENT = "EQUIPMENT"
    UTILITIES = "UTILITIES"
    REPAIRS = "REPAIRS"
    OTHER = "OTHER"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(Enum(ExpenseCategory), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
