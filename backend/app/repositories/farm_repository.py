from sqlalchemy.orm import Session
from app.models.farm import Farm


def list_farms(db: Session):
    return db.query(Farm).all()


def create_farm(db: Session, farm: Farm) -> Farm:
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm