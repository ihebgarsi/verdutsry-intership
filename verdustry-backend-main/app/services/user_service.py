from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.company_repository import CompanyRepository
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse, user_to_response
from app.utils.password import hash_password


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
        self.role_repository = RoleRepository(db)
        self.company_repository = CompanyRepository(db)

    def _resolve_role_id(self, role_id: Optional[int], role_name: Optional[str]) -> int:
        if role_id is not None:
            role = self.role_repository.get_by_id(role_id)
            if not role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid role_id",
                )
            return role.id

        if role_name:
            role = self.role_repository.get_by_name(role_name.upper())
            if not role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role: {role_name}",
                )
            return role.id

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either role or role_id is required",
        )

    def _ensure_company(self, company_id: int) -> None:
        if not self.company_repository.get_by_id(company_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid companyId",
            )

    def get_user(self, user_id: int) -> User:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    def get_all_users(self, company_id: Optional[int] = None) -> List[UserResponse]:
        users = self.user_repository.get_all()
        if company_id is not None:
            users = [u for u in users if u.company_id == company_id]
        return [user_to_response(u) for u in users]

    def get_user_response(self, user_id: int) -> UserResponse:
        return user_to_response(self.get_user(user_id))

    def create_user(self, user_data: UserCreate) -> UserResponse:
        existing_user = self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        assert user_data.company_id is not None
        self._ensure_company(user_data.company_id)
        role_id = self._resolve_role_id(user_data.role_id, user_data.role)

        new_user = User(
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            full_name=user_data.full_name,
            role_id=role_id,
            is_active=user_data.is_active if user_data.is_active is not None else True,
            company_id=user_data.company_id,
        )
        created = self.user_repository.create(new_user)
        return user_to_response(created)

    def update_user(self, user_id: int, user_data: UserUpdate) -> UserResponse:
        user = self.get_user(user_id)

        if user_data.email is not None:
            user.email = user_data.email
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        if user_data.role_id is not None or user_data.role is not None:
            user.role_id = self._resolve_role_id(user_data.role_id, user_data.role)
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        if user_data.password:
            user.hashed_password = hash_password(user_data.password)
        if user_data.company_id is not None:
            self._ensure_company(user_data.company_id)
            user.company_id = user_data.company_id

        updated = self.user_repository.update(user)
        return user_to_response(updated)

    def delete_user(self, user_id: int) -> None:
        user = self.get_user(user_id)
        self.user_repository.delete(user)
