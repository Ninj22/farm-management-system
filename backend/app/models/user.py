import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    FARM_MANAGER = "FARM_MANAGER"
    INVENTORY_STAFF = "INVENTORY_STAFF"
    VETERINARY_STAFF = "VETERINARY_STAFF"
    SALES_STAFF = "SALES_STAFF"
    GENERAL_STAFF = "GENERAL_STAFF"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.GENERAL_STAFF)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
