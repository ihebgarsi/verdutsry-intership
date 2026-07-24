from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginResponse, user_to_auth_response
from app.utils.google_oauth import verify_google_id_token
from app.utils.jwt import create_access_token
from app.utils.password import verify_password


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
        _ = user.role
        return LoginResponse(
            access_token=self.create_token(user),
            user=user_to_auth_response(user),
        )

    def login_with_google(self, id_token_str: str) -> LoginResponse:
        """Verify Google ID token and log in an existing user only."""
        info = verify_google_id_token(id_token_str)
        email = str(info["email"]).lower().strip()

        user = self.user_repository.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found for this Google email. Ask a platform admin to create your user first.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user",
            )
        return self.build_login_response(user)
