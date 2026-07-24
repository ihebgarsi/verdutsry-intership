from typing import Optional, Any

from pydantic import BaseModel, ConfigDict, Field


class CompanyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sector: str = Field(min_length=1, max_length=255)
    country: str = Field(min_length=1, max_length=255)


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sector: Optional[str] = Field(default=None, min_length=1, max_length=255)
    country: Optional[str] = Field(default=None, min_length=1, max_length=255)


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    sector: str
    country: str
    createdAt: Optional[str] = None


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
