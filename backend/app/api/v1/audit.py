from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import require_roles
from app.models.user import UserRole
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut

router = APIRouter()


@router.get("", response_model=list[AuditLogOut], dependencies=[Depends(require_roles([UserRole.ADMIN]))])
def list_audit_logs(entity: str | None = None, skip: int = 0, limit: int = Query(50, le=200), db: Session = Depends(get_db)):
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if entity:
        query = query.filter(AuditLog.entity == entity)
    return query.offset(skip).limit(limit).all()
