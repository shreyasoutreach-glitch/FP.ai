"""Async SQLAlchemy database setup."""
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create all tables."""
    if "sqlite" in settings.DATABASE_URL:
        raw_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
        dir_name = os.path.dirname(raw_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
    async with engine.begin() as conn:
        from app.models import document, analysis  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
