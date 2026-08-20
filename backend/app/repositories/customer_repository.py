from sqlalchemy.orm import Session

from app.models.customer import Customer


def list_customers(db: Session, search: str | None, skip: int, limit: int):
    query = db.query(Customer)
    if search:
        query = query.filter(Customer.name.ilike(f"%{search}%"))
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def create_customer(db: Session, customer: Customer) -> Customer:
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
