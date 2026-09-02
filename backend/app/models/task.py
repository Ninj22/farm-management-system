import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class TaskCategory(str, enum.Enum):
    FEEDING = "FEEDING"
    WEEDING = "WEEDING"
    HARVESTING = "HARVESTING"
    MAINTENANCE = "MAINTENANCE"
    VETERINARY = "VETERINARY"
    CLEANING = "CLEANING"
    OTHER = "OTHER"


class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Task(Base):
    """A single unit of work. Recurring tasks (e.g. 'feed cows daily') are a
    deliberately deferred future feature — this models one-off and manually
    repeated tasks only, which already covers most real farm coordination."""
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(Enum(TaskCategory), nullable=False, default=TaskCategory.OTHER)
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    due_date = Column(Date, nullable=True)

    # Optional links to what the task is about — only the relevant one gets set
    field_id = Column(UUID(as_uuid=True), ForeignKey("fields.id"), nullable=True)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id"), nullable=True)
    livestock_id = Column(UUID(as_uuid=True), ForeignKey("livestock.id"), nullable=True)
    equipment_id = Column(UUID(as_uuid=True), ForeignKey("equipment.id"), nullable=True)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    completed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    completion_notes = Column(String, nullable=True)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assignees = relationship("TaskAssignee", back_populates="task")


class TaskAssignee(Base):
    """Join table — a task can have multiple assigned workers (e.g. the whole
    morning livestock team), without duplicating the task itself."""
    __tablename__ = "task_assignees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="assignees")
