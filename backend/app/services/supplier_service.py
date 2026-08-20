import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.repositories import supplier_repository
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def create_supplier(db: Session, payload: SupplierCreate) -> Supplier:
    supplier = Supplier(**payload.model_dump())
    return supplier_repository.create_supplier(db, supplier)


def update_supplier(db: Session, supplier_id: uuid.UUID, payload: SupplierUpdate) -> Supplier:
    supplier = supplier_repository.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(supplier, field, value)
    return supplier_repository.save(db, supplier)
