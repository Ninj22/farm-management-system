import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.expense import ExpenseCategory


class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: Decimal
    expense_date: date
    supplier_id: Optional[uuid.UUID] = None
    description: Optional[str] = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    category: ExpenseCategory
    amount: Decimal
    expense_date: date
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseSummary(BaseModel):
    category: ExpenseCategory
    total: Decimal
