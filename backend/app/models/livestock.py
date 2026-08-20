import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Column, String, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Sex(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class LivestockStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SOLD = "SOLD"
    DECEASED = "DECEASED"
    TRANSFERRED = "TRANSFERRED"


class Livestock(Base):
    __tablename__ = "livestock"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tag_number = Column(String, unique=True, nullable=False, index=True)
    species = Column(String, nullable=False, default="Cattle")
    breed = Column(String, nullable=True)
    sex = Column(Enum(Sex), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    acquisition_date = Column(Date, nullable=True)
    source = Column(String, nullable=True)
    status = Column(Enum(LivestockStatus), nullable=False, default=LivestockStatus.ACTIVE)
    location = Column(String, nullable=True)
    dam_id = Column(UUID(as_uuid=True), ForeignKey("livestock.id"), nullable=True)
    sire_id = Column(UUID(as_uuid=True), ForeignKey("livestock.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
