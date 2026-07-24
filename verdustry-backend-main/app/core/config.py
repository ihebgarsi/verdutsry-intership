from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    # Same client ID as the Next.js Google OAuth app (token audience)
    GOOGLE_CLIENT_ID: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()