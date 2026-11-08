"""Database models for FP.ai."""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, JSON, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename: Mapped[str] = mapped_column(String(255))
    original_name: Mapped[str] = mapped_column(String(255))
    file_size: Mapped[int] = mapped_column(Integer)
    file_type: Mapped[str] = mapped_column(String(50))
    # Retained for compatibility with pre-migration rows; new uploads use file_data.
    upload_path: Mapped[str] = mapped_column(String(512), default="")
    file_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    contract_type: Mapped[str] = mapped_column(String(100), default="Unknown")
    status: Mapped[str] = mapped_column(String(50), default="uploaded")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
