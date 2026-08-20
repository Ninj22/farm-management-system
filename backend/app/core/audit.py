import uuid
from typing import Optional
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    user_id: Optional[uuid.UUID],
    action: str,
    entity: str,
    entity_id: Optional[uuid.UUID] = None,
    changes: Optional[dict] = None,
) -> None:
    entry = AuditLog(user_id=user_id, action=action, entity=entity, entity_id=entity_id, changes=changes)
    db.add(entry)
    db.commit()