import uuid
from sqlalchemy.orm import Session

from app.models.task import Task, TaskAssignee


def _to_out_dict(task: Task, db: Session) -> dict:
    """Task's Pydantic schema needs assignee_ids as a plain list, but that's not
    a real column — it's derived from the join table, so we build the dict by hand
    rather than relying on from_attributes alone."""
    assignee_ids = [a.user_id for a in db.query(TaskAssignee).filter(TaskAssignee.task_id == task.id).all()]
    return {
        "id": task.id, "farm_id": task.farm_id, "title": task.title, "description": task.description,
        "category": task.category, "priority": task.priority, "status": task.status, "due_date": task.due_date,
        "field_id": task.field_id, "crop_id": task.crop_id, "livestock_id": task.livestock_id, "equipment_id": task.equipment_id,
        "created_by": task.created_by, "completed_by": task.completed_by, "completion_notes": task.completion_notes,
        "started_at": task.started_at, "completed_at": task.completed_at, "created_at": task.created_at,
        "assignee_ids": assignee_ids,
    }


def list_tasks(db: Session, farm_id: uuid.UUID | None, assigned_to: uuid.UUID | None, status: str | None):
    query = db.query(Task)
    if farm_id:
        query = query.filter(Task.farm_id == farm_id)
    if status:
        query = query.filter(Task.status == status)
    if assigned_to:
        assigned_task_ids = [a.task_id for a in db.query(TaskAssignee).filter(TaskAssignee.user_id == assigned_to).all()]
        query = query.filter(Task.id.in_(assigned_task_ids))
    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    return [_to_out_dict(t, db) for t in tasks]


def get_task(db: Session, task_id: uuid.UUID) -> Task | None:
    return db.query(Task).filter(Task.id == task_id).first()


def get_task_out(db: Session, task_id: uuid.UUID) -> dict | None:
    task = get_task(db, task_id)
    return _to_out_dict(task, db) if task else None


def create_task(db: Session, task: Task, assignee_ids: list[uuid.UUID]) -> dict:
    db.add(task)
    db.flush()
    for user_id in assignee_ids:
        db.add(TaskAssignee(task_id=task.id, user_id=user_id))
    db.commit()
    db.refresh(task)
    return _to_out_dict(task, db)


def save(db: Session, task: Task) -> dict:
    db.commit()
    db.refresh(task)
    return _to_out_dict(task, db)
