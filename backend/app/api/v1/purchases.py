import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user, require_permission
from app.models.user import User
from app.schemas.purchase import PurchaseCreate, PurchaseOut
from app.services import purchase_service
from app.repositories import purchase_repository

router = APIRouter()
@router.get("", response_model=list[PurchaseOut], dependencies=[Depends(get_current_user)])
def list_purchases(skip: int = 0, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    items, _ = purchase_repository.list_purchases(db, skip, limit)
    return items


@router.get("/{purchase_id}", response_model=PurchaseOut, dependencies=[Depends(get_current_user)])
def get_purchase(purchase_id: uuid.UUID, db: Session = Depends(get_db)):
    return purchase_repository.get_purchase(db, purchase_id)


@router.post("", response_model=PurchaseOut, dependencies=[Depends(require_permission("purchases.create"))])
def create_purchase(payload: PurchaseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return purchase_service.create_purchase(db, payload, created_by=current_user.id)
