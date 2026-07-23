from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator
from typing import Optional, Any


class AuthUserResponse(BaseModel):
    """Frontend-friendly user shape."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    role: str
    isActive: bool
    companyId: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class SignupRequest(BaseModel):
    companyName: str = Field(min_length=1)
    sector: str = Field(min_length=1)
    country: str = Field(min_length=1)
    adminName: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    sector: str
    country: str
    createdAt: Optional[str] = None


class SignupResponse(BaseModel):
    company: CompanyResponse
    user: AuthUserResponse


def user_to_auth_response(user: Any) -> AuthUserResponse:
    return AuthUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.full_name or user.email,
        role=user.role.name if user.role else "",
        isActive=bool(user.is_active),
        companyId=str(user.company_id) if user.company_id is not None else None,
    )


def company_to_response(company: Any) -> CompanyResponse:
    created = None
    if getattr(company, "created_at", None) is not None:
        created = company.created_at.isoformat()
    return CompanyResponse(
        id=str(company.id),
        name=company.name,
        sector=company.sector,
        country=company.country,
        createdAt=created,
    )
