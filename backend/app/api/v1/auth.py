from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut, Token
from app.services import auth_service
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    token = auth_service.login(db, form_data.username, form_data.password)
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserOut], dependencies=[Depends(require_roles([UserRole.ADMIN, UserRole.FARM_MANAGER]))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.patch("/users/{user_id}/deactivate", response_model=UserOut, dependencies=[Depends(require_roles([UserRole.ADMIN]))])
def deactivate_user(user_id, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/activate", response_model=UserOut, dependencies=[Depends(require_roles([UserRole.ADMIN]))])
def activate_user(user_id, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
