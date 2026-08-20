import uuid
from sqlalchemy.orm import Session, joinedload

from app.models.purchase import Purchase, PurchaseItem


def create_purchase(db: Session, purchase: Purchase, items: list[PurchaseItem]) -> Purchase:
    db.add(purchase)
    db.flush()  # get purchase.id before attaching items
    for item in items:
        item.purchase_id = purchase.id
        db.add(item)
    db.commit()
    db.refresh(purchase)
    return purchase


def list_purchases(db: Session, skip: int, limit: int):
    query = db.query(Purchase).options(joinedload(Purchase.items)).order_by(Purchase.purchase_date.desc())
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def get_purchase(db: Session, purchase_id: uuid.UUID) -> Purchase | None:
    return db.query(Purchase).options(joinedload(Purchase.items)).filter(Purchase.id == purchase_id).first()
