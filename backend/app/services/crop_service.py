import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.crop import Crop, CropActivity, Harvest, CropStatus
from app.models.inventory import StockTransactionType
from app.repositories import crop_repository
from app.schemas.crop import CropCreate, CropActivityCreate, HarvestCreate
from app.schemas.inventory import StockTransactionCreate
from app.services import inventory_service
from app.core.audit import log_action


def create_crop(db: Session, payload: CropCreate, user_id: uuid.UUID) -> Crop:
    crop = Crop(**payload.model_dump())
    crop = crop_repository.create_crop(db, crop)
    log_action(db, user_id, "CREATE", "Crop", crop.id)
    return crop


def record_activity(db: Session, crop_id: uuid.UUID, payload: CropActivityCreate, user_id: uuid.UUID) -> CropActivity:
    crop = crop_repository.get_crop(db, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")

    activity = CropActivity(crop_id=crop_id, **payload.model_dump())
    activity = crop_repository.add_activity(db, activity)

    if payload.input_item_id and payload.quantity_used:
        inventory_service.record_transaction(
            db,
            item_id=payload.input_item_id,
            payload=StockTransactionCreate(
                quantity=-payload.quantity_used,
                transaction_type=StockTransactionType.CONSUMPTION,
                reference_type="crop_activity",
                reference_id=activity.id,
            ),
            user_id=user_id,
        )

    if crop.status == CropStatus.PLANTED:
        crop.status = CropStatus.GROWING
        crop_repository.save_crop(db, crop)

    return activity


def record_harvest(db: Session, crop_id: uuid.UUID, payload: HarvestCreate, user_id: uuid.UUID) -> Harvest:
    """Each call adds a NEW harvest row — supports crops harvested repeatedly
    (sukuma wiki, napier grass), not just a single one-time harvest."""
    crop = crop_repository.get_crop(db, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")

    harvest = Harvest(crop_id=crop_id, **payload.model_dump())
    harvest = crop_repository.add_harvest(db, harvest)

    crop.status = CropStatus.HARVESTING
    crop_repository.save_crop(db, crop)

    if payload.produce_inventory_item_id:
        inventory_service.record_transaction(
            db,
            item_id=payload.produce_inventory_item_id,
            payload=StockTransactionCreate(
                quantity=payload.quantity,
                transaction_type=StockTransactionType.PRODUCTION,
                reference_type="harvest",
                reference_id=harvest.id,
            ),
            user_id=user_id,
        )

    log_action(db, user_id, "HARVEST", "Crop", crop.id, changes={"quantity": str(payload.quantity), "unit": payload.unit})
    return harvest


def mark_completed(db: Session, crop_id: uuid.UUID, user_id: uuid.UUID) -> Crop:
    """Explicit action to close out a crop cycle once no more harvests are expected —
    separate from the automatic PLANTED->GROWING->HARVESTING transitions."""
    crop = crop_repository.get_crop(db, crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    crop.status = CropStatus.COMPLETED
    crop_repository.save_crop(db, crop)
    log_action(db, user_id, "COMPLETE", "Crop", crop.id)
    return crop
