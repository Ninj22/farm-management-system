from sqlalchemy.orm import Session

from app.models.treatment import Treatment
from app.models.inventory import MovementType
from app.repositories import treatment_repository
from app.schemas.treatment import TreatmentCreate
from app.schemas.inventory import StockAdjustment
from app.services import inventory_service


def record_treatment(db: Session, payload: TreatmentCreate) -> Treatment:
    treatment = Treatment(**payload.model_dump())
    treatment = treatment_repository.create_treatment(db, treatment)

    # This is the "using medicine decreases inventory" rule from the spec —
    # reuses the exact same adjust_stock function purchases use, just USAGE_OUT instead of PURCHASE_IN.
    if payload.medicine_item_id and payload.dosage_quantity:
        inventory_service.adjust_stock(
            db,
            item_id=payload.medicine_item_id,
            adjustment=StockAdjustment(
                quantity=payload.dosage_quantity,
                movement_type=MovementType.USAGE_OUT,
                reference=f"treatment:{treatment.id}",
            ),
        )

    return treatment
