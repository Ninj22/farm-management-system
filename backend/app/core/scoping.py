"""
Farm-level resource scoping. ADMIN bypasses all scope checks (full access,
same as the permission wildcard). Every other role is restricted to farms
explicitly granted via UserFarmAccess.
"""
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.user_farm_access import UserFarmAccess
from app.models.store import Store


def get_accessible_farm_ids(db: Session, user: User) -> set[uuid.UUID] | None:
    """None means unrestricted (ADMIN); otherwise the set of farm IDs the user may access."""
    if user.role == UserRole.ADMIN:
        return None
    rows = db.query(UserFarmAccess.farm_id).filter(UserFarmAccess.user_id == user.id).all()
    return {r[0] for r in rows}


def assert_farm_access(db: Session, user: User, farm_id: uuid.UUID) -> None:
    allowed = get_accessible_farm_ids(db, user)
    if allowed is not None and farm_id not in allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to this farm")


def assert_store_access(db: Session, user: User, store_id: uuid.UUID) -> None:
    allowed = get_accessible_farm_ids(db, user)
    if allowed is None:
        return
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    if store.farm_id not in allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to this store")
