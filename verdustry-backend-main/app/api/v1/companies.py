from typing import List

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import require_role
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.services.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=List[CompanyResponse])
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Platform admin: list all companies."""
    return CompanyService(db).get_all()


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return CompanyService(db).get(company_id)


@router.post("", response_model=CompanyResponse, status_code=201)
def create_company(
    body: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    """Platform admin creates a company."""
    return CompanyService(db).create(body)


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    body: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    return CompanyService(db).update(company_id, body)


@router.delete("/{company_id}", status_code=204)
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN")),
):
    CompanyService(db).delete(company_id)
    return Response(status_code=204)
