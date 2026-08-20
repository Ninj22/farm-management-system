import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Numeric, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class FarmStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Farm(Base):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    county = Column(String, nullable=True)
    sub_county = Column(String, nullable=True)
    location = Column(String, nullable=True)
    size = Column(Numeric(12, 2), nullable=True)
    status = Column(Enum(FarmStatus), nullable=False, default=FarmStatus.ACTIVE)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
