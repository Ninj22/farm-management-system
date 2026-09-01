import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission
from app.models.user import User
from app.models.crop import Field
from app.schemas.crop import (
    FieldCreate, FieldOut, CropCreate, CropOut,
    CropActivityCreate, CropActivityOut, HarvestCreate, HarvestOut,
)
from app.services import crop_service
from app.repositories import crop_repository

router = APIRouter()


@router.get("/fields", response_model=list[FieldOut], dependencies=[Depends(get_current_user)])
def list_fields(farm_id: uuid.UUID | None = None, db: Session = Depends(get_db)):
    return crop_repository.list_fields(db, farm_id)


@router.post("/fields", response_model=FieldOut, dependencies=[Depends(require_permission("fields.create"))])
def create_field(payload: FieldCreate, db: Session = Depends(get_db)):
    field = Field(**payload.model_dump())
    return crop_repository.create_field(db, field)


@router.get("", response_model=list[CropOut], dependencies=[Depends(get_current_user)])
def list_crops(field_id: uuid.UUID | None = None, status: str | None = None, db: Session = Depends(get_db)):
    return crop_repository.list_crops(db, field_id, status)


@router.post("", response_model=CropOut, dependencies=[Depends(require_permission("crops.create"))])
def create_crop(payload: CropCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crop_service.create_crop(db, payload, current_user.id)


@router.get("/{crop_id}/activities", response_model=list[CropActivityOut], dependencies=[Depends(get_current_user)])
def list_activities(crop_id: uuid.UUID, db: Session = Depends(get_db)):
    return crop_repository.list_activities(db, crop_id)


@router.post("/{crop_id}/activities", response_model=CropActivityOut, dependencies=[Depends(require_permission("crops.update"))])
def record_activity(crop_id: uuid.UUID, payload: CropActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crop_service.record_activity(db, crop_id, payload, current_user.id)


@router.get("/{crop_id}/harvests", response_model=list[HarvestOut], dependencies=[Depends(get_current_user)])
def list_harvests(crop_id: uuid.UUID, db: Session = Depends(get_db)):
    return crop_repository.list_harvests(db, crop_id)


@router.post("/{crop_id}/harvests", response_model=HarvestOut, dependencies=[Depends(require_permission("crops.update"))])
def record_harvest(crop_id: uuid.UUID, payload: HarvestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crop_service.record_harvest(db, crop_id, payload, current_user.id)


@router.post("/{crop_id}/complete", response_model=CropOut, dependencies=[Depends(require_permission("crops.update"))])
def complete_crop(crop_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crop_service.mark_completed(db, crop_id, current_user.id)
