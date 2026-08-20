import uuid
from sqlalchemy.orm import Session
from app.models.store import Store


def list_stores(db: Session, farm_id: uuid.UUID | None):
    query = db.query(Store)
    if farm_id:
        query = query.filter(Store.farm_id == farm_id)
    return query.all()


def create_store(db: Session, store: Store) -> Store:
    db.add(store)
    db.commit()
    db.refresh(store)
    return store