"""
Integration and End-to-End API tests for FP.ai
Tests /api/health, /api/training, /api/documents, /api/analysis, and /api/reports.
"""
import io
import json
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check returns operational status."""
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "ml_engine" in data


@pytest.mark.asyncio
async def test_training_knowledge_base_endpoint(client: AsyncClient):
    """Test retrieval of full knowledge base patterns."""
    resp = await client.get("/api/training/knowledge-base")
    assert resp.status_code == 200
    patterns = resp.json()
    assert isinstance(patterns, list)
    assert len(patterns) >= 20
    first = patterns[0]
    assert "name" in first
    assert "category" in first
    assert "risk_level" in first
    assert "red_flag_phrases" in first


@pytest.mark.asyncio
async def test_training_stats_and_add_example(client: AsyncClient, monkeypatch, tmp_path):
    """Test querying stats and submitting a new training example."""
    from app.core.config import settings
    from app.api.routes import training as training_routes
    monkeypatch.setattr(settings, "TRAINING_ADMIN_KEY", "test-admin-key")
    monkeypatch.setattr(training_routes, "TRAINING_FILE", str(tmp_path / "examples.jsonl"))

    stats_resp = await client.get("/api/training/stats")
    assert stats_resp.status_code == 200
    assert "total_examples" in stats_resp.json()

    example_payload = {
        "clause_text": "Customer shall indemnify provider against all claims in perpetuity.",
        "category": "indemnity",
        "risk_level": "critical",
        "is_exploitative": True,
        "notes": "Test submission from test suite",
        "source": "test_suite",
    }
    add_resp = await client.post("/api/training/examples", json=example_payload, headers={"Authorization": "Bearer test-admin-key"})
    assert add_resp.status_code == 201
    assert add_resp.json()["status"] == "added"

    rejected = await client.post("/api/training/examples", json=example_payload)
    assert rejected.status_code == 401


@pytest.mark.asyncio
async def test_list_demo_contracts(client: AsyncClient):
    """Test listing available demo contracts."""
    resp = await client.get("/api/analysis/demos")
    assert resp.status_code == 200
    data = resp.json()
    assert "demos" in data
    assert len(data["demos"]) >= 3
    demo_ids = [d["id"] for d in data["demos"]]
    assert "employment_toxic" in demo_ids
    assert "saas_tos_unfair" in demo_ids


@pytest.mark.asyncio
async def test_demo_analysis_employment(client: AsyncClient):
    """Test direct execution of demo analysis for employment_toxic contract."""
    resp = await client.get("/api/analysis/demo/employment_toxic")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "completed"
    assert data["analysis_id"] is not None
    assert data["document_id"] == "demo-employment_toxic"
    assert data["contract_type"] == "Employment Contract"
    assert data["critical_count"] >= 1
    assert data["overall_risk_rating"] == "critical"
    assert len(data["clauses"]) >= 5

    # Check that critical clauses like non-compete and training bond were flagged
    matched_patterns = [c.get("matched_pattern") for c in data["clauses"] if c.get("matched_pattern")]
    assert any("Non-Compete" in str(p) for p in matched_patterns)


@pytest.mark.asyncio
async def test_demo_analysis_saas(client: AsyncClient):
    """Test direct execution of demo analysis for saas_tos_unfair contract."""
    resp = await client.post("/api/analysis/demo/saas_tos_unfair")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "completed"
    assert data["analysis_id"] is not None
    assert data["overall_risk_score"] > 30.0
    assert len(data["clauses"]) >= 4


@pytest.mark.asyncio
async def test_demo_invalid_id(client: AsyncClient):
    """Test requesting non-existent demo sample returns 404."""
    resp = await client.get("/api/analysis/demo/non_existent_sample_xyz")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_document_upload_analyze_and_reports_workflow(client: AsyncClient, sample_txt_bytes: bytes, test_db_session):
    """
    Full end-to-end user workflow:
    1. Upload a document
    2. List documents
    3. Run analysis
    4. Fetch analysis results
    5. Download PDF report
    6. Download JSON report
    7. Delete document
    """
    # 1. Upload document
    files = {"file": ("test_freelance_nda.txt", sample_txt_bytes, "text/plain")}
    upload_resp = await client.post("/api/documents/upload", files=files)
    assert upload_resp.status_code == 200
    doc_data = upload_resp.json()
    doc_id = doc_data["id"]
    assert doc_id is not None
    assert doc_data["original_name"] == "test_freelance_nda.txt"
    # Binary source content must stay server-side, never in API responses.
    assert "file_data" not in doc_data
    from sqlalchemy import select
    from app.models.document import Document
    stored_doc = await test_db_session.scalar(select(Document).where(Document.id == doc_id))
    assert stored_doc is not None
    assert bytes(stored_doc.file_data) == sample_txt_bytes

    # 2. List documents
    list_resp = await client.get("/api/documents/")
    assert list_resp.status_code == 200
    docs = list_resp.json()
    assert any(d["id"] == doc_id for d in docs)
    assert all("file_data" not in item for item in docs)

    # 3. Run analysis
    run_resp = await client.post("/api/analysis/run", json={"document_id": doc_id, "use_gemini": False})
    assert run_resp.status_code == 200
    analysis_data = run_resp.json()
    analysis_id = analysis_data["analysis_id"]
    assert analysis_id is not None
    assert analysis_data["status"] == "completed"
    assert len(analysis_data["clauses"]) > 0

    # 4. Fetch analysis by ID
    get_ana_resp = await client.get(f"/api/analysis/{analysis_id}")
    assert get_ana_resp.status_code == 200
    assert get_ana_resp.json()["analysis_id"] == analysis_id

    # 5. Download PDF report
    pdf_resp = await client.get(f"/api/reports/{analysis_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert "attachment" in pdf_resp.headers.get("content-disposition", "")
    pdf_content = pdf_resp.content
    assert pdf_content.startswith(b"%PDF"), "Generated PDF does not start with valid PDF magic bytes"
    assert len(pdf_content) > 1000

    # 6. Download JSON report
    json_resp = await client.get(f"/api/reports/{analysis_id}/json")
    assert json_resp.status_code == 200
    assert "application/json" in json_resp.headers["content-type"]
    exported_data = json.loads(json_resp.content.decode("utf-8"))
    assert exported_data["analysis_id"] == analysis_id
    assert "risk_counts" in exported_data
    assert "clauses" in exported_data

    # 7. Delete document
    del_resp = await client.delete(f"/api/documents/{doc_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted"] == doc_id

    deleted_analysis = await client.get(f"/api/analysis/{analysis_id}")
    assert deleted_analysis.status_code == 404

    deleted_report = await client.get(f"/api/reports/{analysis_id}/json")
    assert deleted_report.status_code == 404
    deleted_doc = await test_db_session.scalar(select(Document).where(Document.id == doc_id))
    assert deleted_doc is None


@pytest.mark.asyncio
async def test_upload_rejects_mismatched_pdf_signature(client: AsyncClient):
    files = {"file": ("not-a-pdf.pdf", b"plain text masquerading as PDF", "application/pdf")}
    response = await client.post("/api/documents/upload", files=files)
    assert response.status_code == 415


@pytest.mark.asyncio
async def test_upload_rejects_legacy_doc_format(client: AsyncClient):
    files = {"file": ("legacy.doc", b"legacy Word binary content", "application/msword")}
    response = await client.post("/api/documents/upload", files=files)
    assert response.status_code == 415


@pytest.mark.asyncio
async def test_upload_rejects_empty_file(client: AsyncClient):
    files = {"file": ("empty.txt", b"", "text/plain")}
    response = await client.post("/api/documents/upload", files=files)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_explain_clause_endpoint(client: AsyncClient):
    """Test the plain English clause explanation endpoint."""
    payload = {
        "clause_text": "The Employee agrees to forfeit all bonus payments in the event of resignation.",
        "context": "Employment Agreement Section 5",
    }
    resp = await client.post("/api/analysis/explain-clause", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "explanation" in data


@pytest.mark.asyncio
async def test_reports_not_found(client: AsyncClient):
    """Test 404 behavior for invalid analysis IDs."""
    pdf_resp = await client.get("/api/reports/non_existent_id/pdf")
    assert pdf_resp.status_code == 404

    json_resp = await client.get("/api/reports/non_existent_id/json")
    assert json_resp.status_code == 404
