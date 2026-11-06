"""Analysis result models."""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id"))
    contract_type: Mapped[str] = mapped_column(String(100))
    overall_risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_risk_rating: Mapped[str] = mapped_column(String(20), default="unknown")
    critical_count: Mapped[int] = mapped_column(Integer, default=0)
    high_count: Mapped[int] = mapped_column(Integer, default=0)
    medium_count: Mapped[int] = mapped_column(Integer, default=0)
    low_count: Mapped[int] = mapped_column(Integer, default=0)
    total_clauses: Mapped[int] = mapped_column(Integer, default=0)
    readability_score: Mapped[float] = mapped_column(Float, default=50.0)
    power_imbalance_score: Mapped[int] = mapped_column(Integer, default=50)
    executive_summary: Mapped[str] = mapped_column(Text, default="")
    clauses_json: Mapped[dict] = mapped_column(JSON, default=list)
    gemini_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    recommendations: Mapped[dict] = mapped_column(JSON, default=list)
    top_risks: Mapped[dict] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processing_time_ms: Mapped[int] = mapped_column(Integer, default=0)
