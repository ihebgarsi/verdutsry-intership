from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import get_current_user
from app.services.auth_service import AuthService
from app.schemas.auth import (
    AuthUserResponse,
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    user_to_auth_response,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 form login (Swagger / tests). username = email."""
    auth_service = AuthService(db)
    user = auth_service.authenticate(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.build_login_response(user)


@router.post("/login/json", response_model=LoginResponse)
def login_json(
    body: LoginRequest,
    db: Session = Depends(get_db),
):
    """JSON login for the Next.js frontend."""
    auth_service = AuthService(db)
    user = auth_service.authenticate(str(body.email), body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.build_login_response(user)


@router.post("/google", response_model=LoginResponse)
def login_google(
    body: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    """Exchange a Google ID token for an API access token + user."""
    auth_service = AuthService(db)
    return auth_service.login_with_google(body.id_token)


@router.get("/me", response_model=AuthUserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_auth_response(current_user)
