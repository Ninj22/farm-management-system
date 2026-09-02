import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.repositories import task_repository
from app.schemas.task import TaskCreate, TaskStatusUpdate
from app.core.audit import log_action


def create_task(db: Session, payload: TaskCreate, user_id: uuid.UUID) -> dict:
    data = payload.model_dump(exclude={"assignee_ids"})
    task = Task(**data, created_by=user_id)
    result = task_repository.create_task(db, task, payload.assignee_ids)
    log_action(db, user_id, "CREATE", "Task", task.id, changes={"title": payload.title, "assignees": len(payload.assignee_ids)})
    return result


def update_status(db: Session, task_id: uuid.UUID, payload: TaskStatusUpdate, user_id: uuid.UUID) -> dict:
    """Handles the PENDING -> IN_PROGRESS -> COMPLETED workflow, stamping
    started_at/completed_at/completed_by automatically as the status changes —
    the worker just picks a status, the timeline records itself."""
    task = task_repository.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    now = datetime.now(timezone.utc)

    if payload.status == TaskStatus.IN_PROGRESS and task.started_at is None:
        task.started_at = now

    if payload.status == TaskStatus.COMPLETED:
        task.completed_at = now
        task.completed_by = user_id
        if payload.completion_notes:
            task.completion_notes = payload.completion_notes

    task.status = payload.status
    result = task_repository.save(db, task)
    log_action(db, user_id, "UPDATE_STATUS", "Task", task.id, changes={"status": payload.status.value})
    return result
