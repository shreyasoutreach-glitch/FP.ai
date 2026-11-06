"""Health check endpoints."""
from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    ml_engine: str


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request):
    ml_engine = request.app.state.ml_engine
    return HealthResponse(
        status="ok",
        version="1.0.0",
        ml_engine="loaded" if (ml_engine and ml_engine.is_loaded) else "loading",
    )
