import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.livestock import Livestock, LivestockStatus
from app.repositories import livestock_repository
from app.schemas.livestock import LivestockCreate, LivestockUpdate


def create_livestock(db: Session, payload: LivestockCreate, current_user) -> Livestock:
    from app.core.scoping import assert_farm_access
    assert_farm_access(db, current_user, payload.farm_id)
    animal = Livestock(**payload.model_dump())
    return livestock_repository.create_livestock(db, animal)


def update_livestock(db: Session, livestock_id: uuid.UUID, payload: LivestockUpdate) -> Livestock:
    animal = livestock_repository.get_livestock(db, livestock_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(animal, field, value)
    return livestock_repository.save(db, animal)


def mark_sold(db: Session, livestock_id: uuid.UUID) -> Livestock:
    """Called by sales_service when a livestock sale is recorded — never delete the animal record."""
    animal = livestock_repository.get_livestock(db, livestock_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.status != LivestockStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Animal is not active")
    animal.status = LivestockStatus.SOLD
    return livestock_repository.save(db, animal)
