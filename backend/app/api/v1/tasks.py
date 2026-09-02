import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission
from app.models.user import User
from app.schemas.task import TaskCreate, TaskStatusUpdate, TaskOut
from app.services import task_service
from app.repositories import task_repository

router = APIRouter()


@router.get("", response_model=list[TaskOut], dependencies=[Depends(get_current_user)])
def list_tasks(
    farm_id: uuid.UUID | None = None,
    assigned_to: uuid.UUID | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return task_repository.list_tasks(db, farm_id, assigned_to, status)


@router.get("/mine", response_model=list[TaskOut])
def list_my_tasks(status: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Convenience endpoint — the tasks assigned to whoever's currently logged in.
    This is what the worker-facing checklist view uses."""
    return task_repository.list_tasks(db, None, current_user.id, status)


@router.post("", response_model=TaskOut, dependencies=[Depends(require_permission("tasks.create"))])
def create_task(payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_service.create_task(db, payload, current_user.id)


@router.patch("/{task_id}/status", response_model=TaskOut, dependencies=[Depends(require_permission("tasks.update"))])
def update_status(task_id: uuid.UUID, payload: TaskStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_service.update_status(db, task_id, payload, current_user.id)
