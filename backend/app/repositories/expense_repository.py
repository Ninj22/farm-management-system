from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense


def list_expenses(db: Session, skip: int, limit: int):
    query = db.query(Expense).order_by(Expense.expense_date.desc())
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def create_expense(db: Session, expense: Expense) -> Expense:
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def summary_by_category(db: Session):
    rows = db.query(Expense.category, func.sum(Expense.amount).label("total")).group_by(Expense.category).all()
    return [{"category": r.category, "total": r.total} for r in rows]
