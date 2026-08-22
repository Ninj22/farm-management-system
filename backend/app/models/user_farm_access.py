import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class UserFarmAccess(Base):
    __tablename__ = "user_farm_access"
    __table_args__ = (UniqueConstraint("user_id", "farm_id", name="uq_user_farm"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
