from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseOut, ExpenseSummary
from app.repositories import expense_repository

router = APIRouter()
@router.get("", response_model=list[ExpenseOut], dependencies=[Depends(get_current_user)])
def list_expenses(skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = expense_repository.list_expenses(db, skip, limit)
    return items


@router.post("", response_model=ExpenseOut, dependencies=[Depends(require_permission("expenses.create"))])
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.core.scoping import assert_farm_access
    assert_farm_access(db, current_user, payload.farm_id)
    expense = Expense(**payload.model_dump())
    return expense_repository.create_expense(db, expense)


@router.get("/summary", response_model=list[ExpenseSummary], dependencies=[Depends(get_current_user)])
def expense_summary(db: Session = Depends(get_db)):
    return expense_repository.summary_by_category(db)
