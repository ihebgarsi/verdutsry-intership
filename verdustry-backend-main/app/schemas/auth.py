from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AuthUserResponse(BaseModel):
    """Frontend-friendly user shape."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    role: str
    isActive: bool
    companyId: Optional[str] = None
    companyName: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str = Field(min_length=20)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


def user_to_auth_response(user: Any) -> AuthUserResponse:
    company_name = None
    if getattr(user, "company", None) is not None:
        company_name = user.company.name
    return AuthUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.full_name or user.email,
        role=user.role.name if user.role else "",
        isActive=bool(user.is_active),
        companyId=str(user.company_id) if user.company_id is not None else None,
        companyName=company_name,
    )
