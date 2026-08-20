import uuid
from sqlalchemy.orm import Session

from app.models.inventory import InventoryItem, StockTransaction


def list_items(db: Session, store_id: uuid.UUID | None, search: str | None, skip: int, limit: int):
    query = db.query(InventoryItem).filter(InventoryItem.is_archived.is_(False))
    if store_id:
        query = query.filter(InventoryItem.store_id == store_id)
    if search:
        query = query.filter(InventoryItem.name.ilike(f"%{search}%"))
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def get_item(db: Session, item_id: uuid.UUID) -> InventoryItem | None:
    return db.query(InventoryItem).filter(InventoryItem.id == item_id).first()


def create_item(db: Session, item: InventoryItem) -> InventoryItem:
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def save(db: Session, item: InventoryItem) -> InventoryItem:
    db.commit()
    db.refresh(item)
    return item


def add_transaction(db: Session, txn: StockTransaction) -> StockTransaction:
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


def low_stock_items(db: Session):
    return db.query(InventoryItem).filter(
        InventoryItem.is_archived.is_(False),
        InventoryItem.quantity_on_hand <= InventoryItem.reorder_level,
    ).all()

def total_inventory_value(db: Session):
    from sqlalchemy import func
    result = db.query(func.sum(InventoryItem.quantity_on_hand * InventoryItem.purchase_price)).filter(
        InventoryItem.is_archived.is_(False)
    ).scalar()
    return result or 0
