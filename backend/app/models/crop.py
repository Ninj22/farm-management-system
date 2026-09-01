import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, String, Numeric, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Field(Base):
    __tablename__ = "fields"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    name = Column(String, nullable=False)
    size = Column(Numeric(10, 2), nullable=True)
    size_unit = Column(String, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    crops = relationship("Crop", back_populates="field")


class CropStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    PLANTED = "PLANTED"
    GROWING = "GROWING"
    HARVESTING = "HARVESTING"   # actively being harvested (supports repeated harvests, e.g. sukuma wiki)
    COMPLETED = "COMPLETED"     # crop cycle finished, field cleared
    FAILED = "FAILED"


class Crop(Base):
    """Represents one crop CYCLE — e.g. 'Maize planted in Field A, March 2026' —
    not the crop type itself. The same field can have many Crop rows over time."""
    __tablename__ = "crops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    field_id = Column(UUID(as_uuid=True), ForeignKey("fields.id"), nullable=False)
    crop_type = Column(String, nullable=False)  # "Maize", "Sukuma Wiki", "Sugarcane", "Napier Grass"
    variety = Column(String, nullable=True)
    planting_date = Column(Date, nullable=True)
    expected_harvest_date = Column(Date, nullable=True)
    quantity_planted = Column(Numeric(10, 2), nullable=True)
    planting_unit = Column(String, nullable=True)
    status = Column(Enum(CropStatus), nullable=False, default=CropStatus.PLANNED)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    field = relationship("Field", back_populates="crops")
    activities = relationship("CropActivity", back_populates="crop")
    harvests = relationship("Harvest", back_populates="crop")


class CropActivityType(str, enum.Enum):
    LAND_PREPARATION = "LAND_PREPARATION"
    PLANTING = "PLANTING"
    FERTILIZATION = "FERTILIZATION"
    SPRAYING = "SPRAYING"
    IRRIGATION = "IRRIGATION"
    WEEDING = "WEEDING"
    OTHER = "OTHER"


class CropActivity(Base):
    """A single input/labour event during a crop cycle — fertilizing, spraying, weeding.
    Each activity can consume inventory (fertilizer, pesticide) the same way a
    veterinary treatment consumes medicine."""
    __tablename__ = "crop_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False)
    activity_type = Column(Enum(CropActivityType), nullable=False)
    activity_date = Column(Date, nullable=False)
    input_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=True)
    quantity_used = Column(Numeric(10, 2), nullable=True)
    cost = Column(Numeric(12, 2), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    crop = relationship("Crop", back_populates="activities")


class Harvest(Base):
    """A single harvest EVENT from a crop cycle. One Crop can have many Harvests —
    this is what makes 'harvested sukuma wiki 4 times from one planting' representable,
    instead of a single harvest_date/quantity pair on Crop itself."""
    __tablename__ = "harvests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False)
    harvest_date = Column(Date, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String, nullable=False)  # "kg", "bags", "tonnes"
    produce_inventory_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    crop = relationship("Crop", back_populates="harvests")
