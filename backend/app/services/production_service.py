import uuid
from sqlalchemy.orm import Session

from app.models.production import ProductionRecord
from app.models.inventory import StockTransactionType
from app.repositories import production_repository
from app.schemas.production import ProductionCreate
from app.schemas.inventory import StockTransactionCreate
from app.services import inventory_service
from app.core.audit import log_action


def record_production(db: Session, payload: ProductionCreate, user_id: uuid.UUID) -> ProductionRecord:
    record = ProductionRecord(**payload.model_dump(), recorded_by=user_id)
    record = production_repository.create_production(db, record)

    if payload.produce_inventory_item_id:
        inventory_service.record_transaction(
            db,
            item_id=payload.produce_inventory_item_id,
            payload=StockTransactionCreate(
                quantity=payload.quantity,
                transaction_type=StockTransactionType.PRODUCTION,
                reference_type="production",
                reference_id=record.id,
            ),
            user_id=user_id,
        )

    log_action(db, user_id, "CREATE", "ProductionRecord", record.id, changes={"product_type": payload.product_type, "quantity": str(payload.quantity)})
    return record
