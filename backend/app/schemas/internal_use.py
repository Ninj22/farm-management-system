import uuid
from typing import Optional

from pydantic import BaseModel
from decimal import Decimal


class InternalUseCreate(BaseModel):
    quantity: Decimal  # positive number — the amount consumed
    used_for: str  # free text: "Livestock feed", "Farm consumption", "Spoilage", "Sample/testing"
    livestock_id: Optional[uuid.UUID] = None  # optional — link to which animal/herd if feed-related
    notes: Optional[str] = None
