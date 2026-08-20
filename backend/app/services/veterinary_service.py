from sqlalchemy.orm import Session

from app.models.treatment import Treatment
from app.models.inventory import StockTransactionType
from app.repositories import treatment_repository
from app.schemas.treatment import TreatmentCreate
from app.schemas.inventory import StockTransactionCreate
from app.services import inventory_service


def record_treatment(db: Session, payload: TreatmentCreate, user_id) -> Treatment:
    treatment = Treatment(**payload.model_dump())
    treatment = treatment_repository.create_treatment(db, treatment)

    if payload.medicine_item_id and payload.dosage_quantity:
        inventory_service.record_transaction(
            db,
            item_id=payload.medicine_item_id,
            payload=StockTransactionCreate(
                quantity=-payload.dosage_quantity,
                transaction_type=StockTransactionType.CONSUMPTION,
                reference_type="treatment",
                reference_id=treatment.id,
            ),
            user_id=user_id,
        )

    return treatment
