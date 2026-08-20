import uuid
from sqlalchemy.orm import Session

from app.models.supplier import Supplier


def list_suppliers(db: Session, search: str | None, skip: int, limit: int):
    query = db.query(Supplier)
    if search:
        query = query.filter(Supplier.name.ilike(f"%{search}%"))
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def get_supplier(db: Session, supplier_id: uuid.UUID) -> Supplier | None:
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()


def create_supplier(db: Session, supplier: Supplier) -> Supplier:
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def save(db: Session, supplier: Supplier) -> Supplier:
    db.commit()
    db.refresh(supplier)
    return supplier
