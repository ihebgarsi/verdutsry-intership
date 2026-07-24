from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.company import Company
from app.repositories.company_repository import CompanyRepository
from app.repositories.user_repository import UserRepository
from app.schemas.company import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    company_to_response,
)


class CompanyService:
    def __init__(self, db: Session):
        self.db = db
        self.company_repository = CompanyRepository(db)
        self.user_repository = UserRepository(db)

    def get_all(self) -> List[CompanyResponse]:
        return [company_to_response(c) for c in self.company_repository.get_all()]

    def get(self, company_id: int) -> CompanyResponse:
        company = self.company_repository.get_by_id(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found",
            )
        return company_to_response(company)

    def create(self, data: CompanyCreate) -> CompanyResponse:
        company = Company(
            name=data.name.strip(),
            sector=data.sector.strip(),
            country=data.country.strip(),
        )
        created = self.company_repository.create(company)
        return company_to_response(created)

    def update(self, company_id: int, data: CompanyUpdate) -> CompanyResponse:
        company = self.company_repository.get_by_id(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found",
            )
        if data.name is not None:
            company.name = data.name.strip()
        if data.sector is not None:
            company.sector = data.sector.strip()
        if data.country is not None:
            company.country = data.country.strip()
        updated = self.company_repository.update(company)
        return company_to_response(updated)

    def delete(self, company_id: int) -> None:
        company = self.company_repository.get_by_id(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found",
            )

        linked_users = [
            u for u in self.user_repository.get_all() if u.company_id == company_id
        ]
        if linked_users:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete a company that still has users. Reassign or delete users first.",
            )

        self.company_repository.delete(company)
