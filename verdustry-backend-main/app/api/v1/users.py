from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import require_role
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
def get_users(
    companyId: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Platform admin: list users, optionally filtered by company."""
    service = UserService(db)
    company_id = int(companyId) if companyId else None
    return service.get_all_users(company_id=company_id)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    service = UserService(db)
    return service.get_user_response(user_id)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Platform admin creates a company user and assigns a role."""
    service = UserService(db)
    return service.create_user(user_data)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    service = UserService(db)
    return service.update_user(user_id, user_data)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    service = UserService(db)
    service.delete_user(user_id)
    return Response(status_code=204)
