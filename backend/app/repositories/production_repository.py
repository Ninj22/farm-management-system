import uuid
from sqlalchemy.orm import Session

from app.models.production import ProductionRecord


def list_production(db: Session, farm_id: uuid.UUID | None, livestock_id: uuid.UUID | None, product_type: str | None):
    query = db.query(ProductionRecord)
    if farm_id:
        query = query.filter(ProductionRecord.farm_id == farm_id)
    if livestock_id:
        query = query.filter(ProductionRecord.livestock_id == livestock_id)
    if product_type:
        query = query.filter(ProductionRecord.product_type == product_type)
    return query.order_by(ProductionRecord.production_date.desc()).all()


def create_production(db: Session, record: ProductionRecord) -> ProductionRecord:
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def totals_by_type(db: Session, farm_id: uuid.UUID, days: int = 7):
    from datetime import date, timedelta
    from sqlalchemy import func
    cutoff = date.today() - timedelta(days=days)
    rows = db.query(
        ProductionRecord.product_type, func.sum(ProductionRecord.quantity).label("total")
    ).filter(
        ProductionRecord.farm_id == farm_id,
        ProductionRecord.production_date >= cutoff,
    ).group_by(ProductionRecord.product_type).all()
    return [{"product_type": r.product_type, "total": r.total} for r in rows]
