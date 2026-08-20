import uuid
from sqlalchemy.orm import Session, joinedload

from app.models.sale import Sale, SaleItem


def create_sale(db: Session, sale: Sale, items: list[SaleItem]) -> Sale:
    db.add(sale)
    db.flush()
    for item in items:
        item.sale_id = sale.id
        db.add(item)
    db.commit()
    db.refresh(sale)
    return sale


def list_sales(db: Session, skip: int, limit: int):
    query = db.query(Sale).options(joinedload(Sale.items)).order_by(Sale.sale_date.desc())
    total = query.count()
    return query.offset(skip).limit(limit).all(), total
