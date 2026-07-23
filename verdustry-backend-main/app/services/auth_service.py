from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.user_repository import UserRepository
from app.repositories.role_repository import RoleRepository
from app.utils.password import verify_password, hash_password
from app.utils.jwt import create_access_token
from app.models.user import User
from app.models.company import Company
from app.schemas.auth import (
    SignupRequest,
    SignupResponse,
    LoginResponse,
    user_to_auth_response,
    company_to_response,
)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
        self.role_repository = RoleRepository(db)

    def authenticate(self, email: str, password: str) -> Optional[User]:
        user = self.user_repository.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    def create_token(self, user: User) -> str:
        return create_access_token(data={"sub": str(user.id)})

    def build_login_response(self, user: User) -> LoginResponse:
        # Ensure role is loaded
        _ = user.role
        return LoginResponse(
            access_token=self.create_token(user),
            user=user_to_auth_response(user),
        )

    def signup(self, data: SignupRequest) -> SignupResponse:
        existing = self.user_repository.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        admin_role = self.role_repository.get_by_name("ADMIN")
        if not admin_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ADMIN role is not seeded",
            )

        company = Company(
            name=data.companyName.strip(),
            sector=data.sector.strip(),
            country=data.country.strip(),
        )
        self.db.add(company)
        self.db.flush()

        user = User(
            email=str(data.email).lower(),
            hashed_password=hash_password(data.password),
            full_name=data.adminName.strip(),
            role_id=admin_role.id,
            is_active=True,
            company_id=company.id,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(company)
        self.db.refresh(user)

        return SignupResponse(
            company=company_to_response(company),
            user=user_to_auth_response(user),
        )
