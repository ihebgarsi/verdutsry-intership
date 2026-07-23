from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    name: Optional[str] = None
    role_id: Optional[int] = None
    role: Optional[str] = None
    is_active: Optional[bool] = True
    isActive: Optional[bool] = None

    @model_validator(mode="after")
    def normalize(self):
        if self.name and not self.full_name:
            self.full_name = self.name
        if self.isActive is not None:
            self.is_active = self.isActive
        if not self.role_id and not self.role:
            raise ValueError("Either role or role_id is required")
        return self


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    name: Optional[str] = None
    role_id: Optional[int] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    isActive: Optional[bool] = None
    password: Optional[str] = Field(default=None, min_length=6)

    @model_validator(mode="after")
    def normalize(self):
        if self.name and not self.full_name:
            self.full_name = self.name
        if self.isActive is not None:
            self.is_active = self.isActive
        return self


class UserResponse(BaseModel):
    """API user response compatible with frontend."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    role: str
    isActive: bool
    companyId: Optional[str] = None


def user_to_response(user) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.full_name or user.email,
        role=user.role.name if user.role else "",
        isActive=bool(user.is_active),
        companyId=str(user.company_id) if user.company_id is not None else None,
    )
