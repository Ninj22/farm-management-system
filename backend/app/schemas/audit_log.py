import uuid
from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    action: str
    entity: str
    entity_id: Optional[uuid.UUID]
    changes: Optional[dict[str, Any]]
    created_at: datetime

    model_config = {"from_attributes": True}
