import uuid
from datetime import date
from sqlalchemy.orm import Session

from app.models.treatment import Treatment


def create_treatment(db: Session, treatment: Treatment) -> Treatment:
    db.add(treatment)
    db.commit()
    db.refresh(treatment)
    return treatment


def list_by_livestock(db: Session, livestock_id: uuid.UUID):
    return db.query(Treatment).filter(Treatment.livestock_id == livestock_id).order_by(Treatment.treatment_date.desc()).all()


def upcoming_follow_ups(db: Session, within_days: int = 14):
    from datetime import timedelta
    cutoff = date.today() + timedelta(days=within_days)
    return db.query(Treatment).filter(
        Treatment.follow_up_date.isnot(None),
        Treatment.follow_up_date <= cutoff,
        Treatment.follow_up_date >= date.today(),
    ).order_by(Treatment.follow_up_date.asc()).all()
