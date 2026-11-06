"""Application configuration via environment variables."""
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "FP.ai"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True

    # Gemini
    GEMINI_API_KEY: str = ""

    # Protects annotation-corpus writes; leave unset to disable the endpoint.
    TRAINING_ADMIN_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./fpai.db"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # ML
    ML_MODEL_DIR: str = "./ml_models"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    MIN_CLUSTER_SIZE: int = 3
    ANOMALY_CONTAMINATION: float = 0.1

    # Files
    MAX_FILE_SIZE_MB: int = 50
    UPLOAD_DIR: str = "./uploads"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost",
        "http://127.0.0.1",
    ]

    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
