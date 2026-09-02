from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut, Token
from app.services import auth_service
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db), authorization: str | None = Header(default=None)):
    """Open ONLY when the database has zero users (first-time setup bootstrap).
    Once any user exists, creating new accounts requires a logged-in ADMIN —
    prevents anyone with the URL from self-registering as ADMIN."""
    from app.repositories import user_repository
    if user_repository.count_users(db) > 0:
        from app.core.deps import get_current_user
        from app.models.user import UserRole
        if not authorization:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Registration requires an authenticated ADMIN")
        token = authorization.replace("Bearer ", "")
        current_user = get_current_user(token=token, db=db)
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only an ADMIN can register new users")
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
