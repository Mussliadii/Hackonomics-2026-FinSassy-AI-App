from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "FinSassy AI"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    # Database (SQLite by default for local dev; set to postgresql:// in .env for production)
    DATABASE_URL: str = "sqlite:///./finsassy.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Groq (free LLM API)
    GROQ_API_KEY: str = ""

    # JWT
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ML Service
    ML_SERVICE_URL: str = "http://localhost:8001"

    # Rate Limiting
    API_RATE_LIMIT: int = 100  # per minute
    LLM_RATE_LIMIT: int = 20  # per minute

    # SMTP (for OTP emails)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@finsassy.ai"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
