import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.task import TaskCategory, TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    farm_id: uuid.UUID
    title: str
    description: Optional[str] = None
    category: TaskCategory = TaskCategory.OTHER
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[date] = None
    field_id: Optional[uuid.UUID] = None
    crop_id: Optional[uuid.UUID] = None
    livestock_id: Optional[uuid.UUID] = None
    equipment_id: Optional[uuid.UUID] = None
    assignee_ids: list[uuid.UUID] = []  # one or more workers assigned to this task


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    completion_notes: Optional[str] = None


class TaskOut(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    title: str
    description: Optional[str]
    category: TaskCategory
    priority: TaskPriority
    status: TaskStatus
    due_date: Optional[date]
    field_id: Optional[uuid.UUID]
    crop_id: Optional[uuid.UUID]
    livestock_id: Optional[uuid.UUID]
    equipment_id: Optional[uuid.UUID]
    created_by: Optional[uuid.UUID]
    completed_by: Optional[uuid.UUID]
    completion_notes: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    assignee_ids: list[uuid.UUID] = []

    model_config = {"from_attributes": True}
