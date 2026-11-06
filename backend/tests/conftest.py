"""Pytest configuration and shared fixtures for FP.ai backend tests."""
import os
import io
import sys
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Ensure backend path is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from main import app
from app.core.database import Base, get_db
from app.ml.engine import FPMLEngine

# Use a test database
TEST_DB_URL = "sqlite+aiosqlite:///./test_fpai.db"
test_engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    """Create all test database tables once per test session."""
    async with test_engine.begin() as conn:
        from app.models import document, analysis  # noqa: F401
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Initialize app ml engine
    app.state.ml_engine = FPMLEngine()
    await app.state.ml_engine.load()

    # Override the database dependency in FastAPI
    app.dependency_overrides[get_db] = override_get_db

    yield

    # Clean up test database
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()
    if os.path.exists("./test_fpai.db"):
        try:
            os.remove("./test_fpai.db")
        except Exception:
            pass


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client bound to FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    """Generate valid multi-page PDF bytes for testing."""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(100, 750, "EMPLOYMENT AGREEMENT")
    c.drawString(100, 720, "1. PROBATION PERIOD")
    c.drawString(100, 700, "The employee shall be on probation for 12 months.")
    c.drawString(100, 680, "2. TERMINATION")
    c.drawString(100, 660, "The Company may terminate this Agreement at any time without cause upon 7 days notice.")
    c.showPage()
    c.drawString(100, 750, "3. NON-COMPETE")
    c.drawString(100, 730, "Employee shall not work for any competitor in India for 2 years post-employment.")
    c.save()
    buf.seek(0)
    return buf.getvalue()


@pytest.fixture
def sample_docx_bytes() -> bytes:
    """Generate valid DOCX bytes containing paragraphs and tables."""
    from docx import Document
    doc = Document()
    doc.add_heading("MASTER SERVICES AGREEMENT", level=1)
    doc.add_paragraph("Article 1: Scope of Services and Performance Obligations.")
    doc.add_paragraph("Article 2: Fees, Invoicing, and Payment Terms.")

    table = doc.add_table(rows=2, cols=2)
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Clause ID"
    hdr_cells[1].text = "Provision"
    row_cells = table.rows[1].cells
    row_cells[0].text = "Sec 3.1"
    row_cells[1].text = "In no event will Company liability exceed $100."

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()


@pytest.fixture
def sample_txt_bytes() -> bytes:
    """Generate plain text contract bytes."""
    content = """CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT

1. Confidential Information:
All technical, financial, and proprietary information disclosed shall be confidential.

2. Exclusions:
Confidential Information does not include information publicly known.

3. Perpetual NDA:
Employee agrees to keep the terms strictly confidential in perpetuity.
"""
    return content.encode("utf-8")
