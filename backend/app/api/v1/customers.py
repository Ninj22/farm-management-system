from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerOut
from app.repositories import customer_repository

router = APIRouter()
@router.get("", response_model=list[CustomerOut], dependencies=[Depends(get_current_user)])
def list_customers(search: str | None = None, skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = customer_repository.list_customers(db, search, skip, limit)
    return items


@router.post("", response_model=CustomerOut, dependencies=[Depends(require_permission("customers.create"))])
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    return customer_repository.create_customer(db, customer)
