import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.inventory import InventoryItem, StockTransaction, StockTransactionType
from app.repositories import inventory_repository
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate, StockTransactionCreate
from app.core.audit import log_action


def create_item(db: Session, payload: InventoryItemCreate, user_id: uuid.UUID) -> InventoryItem:
    data = payload.model_dump(exclude={"quantity_on_hand"})
    item = InventoryItem(**data, quantity_on_hand=0)
    item = inventory_repository.create_item(db, item)

    if payload.quantity_on_hand and payload.quantity_on_hand != 0:
        record_transaction(
            db, item.id,
            StockTransactionCreate(quantity=payload.quantity_on_hand, transaction_type=StockTransactionType.OPENING_BALANCE),
            user_id,
        )
        db.refresh(item)

    log_action(db, user_id, "CREATE", "InventoryItem", item.id)
    return item


def update_item(db: Session, item_id: uuid.UUID, payload: InventoryItemUpdate, user_id: uuid.UUID) -> InventoryItem:
    item = inventory_repository.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    updates = payload.model_dump(exclude_unset=True)
    before = {field: str(getattr(item, field)) for field in updates}
    for field, value in updates.items():
        setattr(item, field, value)
    item = inventory_repository.save(db, item)
    after = {field: str(getattr(item, field)) for field in updates}

    if before != after:
        log_action(db, user_id, "UPDATE", "InventoryItem", item.id, changes={"before": before, "after": after})
    return item


def record_transaction(db: Session, item_id: uuid.UUID, payload: StockTransactionCreate, user_id: uuid.UUID | None) -> InventoryItem:
    item = inventory_repository.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    new_balance = item.quantity_on_hand + payload.quantity
    if new_balance < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock for this transaction")

    balance_before = item.quantity_on_hand
    item.quantity_on_hand = new_balance
    inventory_repository.save(db, item)

    txn = StockTransaction(
        item_id=item.id, transaction_type=payload.transaction_type, quantity=payload.quantity,
        reference_type=payload.reference_type, reference_id=payload.reference_id,
        user_id=user_id, notes=payload.notes,
    )
    inventory_repository.add_transaction(db, txn)
    log_action(
        db, user_id, "ADJUST_STOCK", "InventoryItem", item.id,
        changes={
            "type": payload.transaction_type.value,
            "quantity_change": str(payload.quantity),
            "before": {"quantity_on_hand": str(balance_before)},
            "after": {"quantity_on_hand": str(new_balance)},
        },
    )
    return item