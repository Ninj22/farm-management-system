import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission
from app.models.user import User
from app.models.inventory import StockTransactionType
from app.schemas.internal_use import InternalUseCreate
from app.schemas.inventory import StockTransactionCreate, InventoryItemOut
from app.services import inventory_service

router = APIRouter()


@router.post("/{item_id}", response_model=InventoryItemOut, dependencies=[Depends(require_permission("inventory.adjust"))])
def record_internal_use(item_id: uuid.UUID, payload: InternalUseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Records inventory leaving the farm WITHOUT a sale — e.g. harvested napier grass
    consumed as livestock feed, or produce that spoiled. Uses the same ledger
    mechanism as every other stock change, but tagged with why it left and,
    optionally, which animal/herd it went to."""
    reference_note = f"{payload.used_for}" + (f" | notes: {payload.notes}" if payload.notes else "")
    return inventory_service.record_transaction(
        db,
        item_id=item_id,
        payload=StockTransactionCreate(
            quantity=-payload.quantity,
            transaction_type=StockTransactionType.INTERNAL_USE,
            reference_type="internal_use",
            reference_id=payload.livestock_id,
            notes=reference_note,
        ),
        user_id=current_user.id,
    )
