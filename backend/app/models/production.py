import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ProductionRecord(Base):
    """A single production event — milk collected, eggs collected, etc.
    Deliberately not hard-coded to specific species: product_type is free text
    (like Crop.crop_type) so the farm defines what it actually produces,
    per the 'don't hard-code species-specific behaviour' principle."""
    __tablename__ = "production_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    livestock_id = Column(UUID(as_uuid=True), ForeignKey("livestock.id"), nullable=True)  # null = unit-level (e.g. whole layer house), not one animal
    product_type = Column(String, nullable=False)  # "Milk", "Eggs", "Manure"
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String, nullable=False)  # "litres", "eggs", "kg"
    production_date = Column(Date, nullable=False)
    produce_inventory_item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"), nullable=True)
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
