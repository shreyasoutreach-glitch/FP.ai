"""Async SQLAlchemy database setup for SQLite development and Neon PostgreSQL."""
import os
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


def _database_engine_options(database_url: str) -> tuple[str, dict]:
    """Normalize common PostgreSQL URLs for asyncpg and require TLS for hosted DBs."""
    if database_url.startswith("postgres://"):
        database_url = "postgresql://" + database_url[len("postgres://"):]
    if database_url.startswith("postgresql://"):
        parsed = urlsplit(database_url)
        query = dict(parse_qsl(parsed.query, keep_blank_values=True))
        query.pop("sslmode", None)
        query.pop("channel_binding", None)
        normalized = urlunsplit(("postgresql+asyncpg", parsed.netloc, parsed.path, urlencode(query), parsed.fragment))
        return normalized, {
            "connect_args": {"ssl": "require"},
            "pool_pre_ping": True,
            "pool_size": 3,
            "max_overflow": 2,
            "pool_recycle": 300,
        }
    return database_url, {
        "connect_args": {"check_same_thread": False} if "sqlite" in database_url else {},
    }


_database_url, _engine_options = _database_engine_options(settings.DATABASE_URL)
engine = create_async_engine(_database_url, echo=settings.DEBUG, **_engine_options)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Initialize application tables; safe for an empty production Neon database."""
    if "sqlite" in _database_url:
        raw_path = _database_url.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
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
