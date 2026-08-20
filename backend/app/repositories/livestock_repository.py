import uuid
from sqlalchemy.orm import Session

from app.models.livestock import Livestock


def list_livestock(db: Session, search: str | None, status: str | None, skip: int, limit: int):
    query = db.query(Livestock)
    if search:
        query = query.filter(Livestock.tag_number.ilike(f"%{search}%"))
    if status:
        query = query.filter(Livestock.status == status)
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def get_livestock(db: Session, livestock_id: uuid.UUID) -> Livestock | None:
    return db.query(Livestock).filter(Livestock.id == livestock_id).first()


def create_livestock(db: Session, animal: Livestock) -> Livestock:
    db.add(animal)
    db.commit()
    db.refresh(animal)
    return animal


def save(db: Session, animal: Livestock) -> Livestock:
    db.commit()
    db.refresh(animal)
    return animal
