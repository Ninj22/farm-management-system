import uuid
from sqlalchemy.orm import Session

from app.models.crop import Field, Crop, CropActivity, Harvest


def list_fields(db: Session, farm_id: uuid.UUID | None):
    query = db.query(Field)
    if farm_id:
        query = query.filter(Field.farm_id == farm_id)
    return query.all()


def create_field(db: Session, field: Field) -> Field:
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


def list_crops(db: Session, field_id: uuid.UUID | None, status: str | None):
    query = db.query(Crop)
    if field_id:
        query = query.filter(Crop.field_id == field_id)
    if status:
        query = query.filter(Crop.status == status)
    return query.all()


def get_crop(db: Session, crop_id: uuid.UUID) -> Crop | None:
    return db.query(Crop).filter(Crop.id == crop_id).first()


def create_crop(db: Session, crop: Crop) -> Crop:
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


def save_crop(db: Session, crop: Crop) -> Crop:
    db.commit()
    db.refresh(crop)
    return crop


def add_activity(db: Session, activity: CropActivity) -> CropActivity:
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def list_activities(db: Session, crop_id: uuid.UUID):
    return db.query(CropActivity).filter(CropActivity.crop_id == crop_id).order_by(CropActivity.activity_date.desc()).all()


def add_harvest(db: Session, harvest: Harvest) -> Harvest:
    db.add(harvest)
    db.commit()
    db.refresh(harvest)
    return harvest


def list_harvests(db: Session, crop_id: uuid.UUID):
    return db.query(Harvest).filter(Harvest.crop_id == crop_id).order_by(Harvest.harvest_date.desc()).all()


def total_harvested(db: Session, crop_id: uuid.UUID):
    from sqlalchemy import func
    result = db.query(func.sum(Harvest.quantity)).filter(Harvest.crop_id == crop_id).scalar()
    return result or 0
