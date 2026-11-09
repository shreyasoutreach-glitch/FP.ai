"""Application configuration via environment variables."""
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "FP.ai"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True

    GEMINI_API_KEY: str = ""
    TRAINING_ADMIN_KEY: str = ""
    APP_ACCESS_PASSWORD: str = ""

    DATABASE_URL: str = "sqlite+aiosqlite:///./fpai.db"

    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    REDIS_URL: str = "redis://localhost:6379/0"

    ML_MODEL_DIR: str = "./ml_models"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    MIN_CLUSTER_SIZE: int = 3
    ANOMALY_CONTAMINATION: float = 0.1

    MAX_FILE_SIZE_MB: int = 50
    UPLOAD_DIR: str = "./uploads"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:8000", "http://127.0.0.1:8000",
        "http://localhost", "http://127.0.0.1",
        "https://fp-ai-sher-8b41.vercel.app",
    ]

    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
