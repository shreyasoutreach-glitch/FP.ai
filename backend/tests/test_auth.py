"""Authentication regression tests for the private workspace gate."""
import pytest

from app.core.config import settings
from app.api.routes.auth import require_auth
from main import app


@pytest.mark.asyncio
async def test_login_sets_signed_http_only_session_cookie(client, monkeypatch):
    monkeypatch.setattr(settings, "APP_ACCESS_PASSWORD", "test-workspace-password")
    monkeypatch.setattr(settings, "SECRET_KEY", "test-secret-key-with-more-than-32-characters")
    monkeypatch.setattr(settings, "ALLOWED_ORIGINS", ["https://fp-ai-sher-8b41.vercel.app"])

    response = await client.post(
        "/api/auth/login",
        json={"password": "test-workspace-password"},
    )
    assert response.status_code == 200
    assert response.json()["authenticated"] is True

    cookie = response.headers.get("set-cookie", "").lower()
    assert "fpai_session=" in cookie
    assert "httponly" in cookie
    assert "secure" in cookie
    assert "samesite=none" in cookie

    previous = app.dependency_overrides.pop(require_auth, None)
    try:
        session_response = await client.get("/api/auth/session")
        assert session_response.status_code == 200
        assert session_response.json()["authenticated"] is True
    finally:
        if previous is not None:
            app.dependency_overrides[require_auth] = previous


@pytest.mark.asyncio
async def test_invalid_password_is_rejected(client, monkeypatch):
    monkeypatch.setattr(settings, "APP_ACCESS_PASSWORD", "correct-password")
    monkeypatch.setattr(settings, "SECRET_KEY", "test-secret-key-with-more-than-32-characters")

    response = await client.post("/api/auth/login", json={"password": "wrong-password"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_private_documents_endpoint_rejects_anonymous_request(client, monkeypatch):
    monkeypatch.setattr(settings, "APP_ACCESS_PASSWORD", "correct-password")
    monkeypatch.setattr(settings, "SECRET_KEY", "test-secret-key-with-more-than-32-characters")

    previous = app.dependency_overrides.pop(require_auth, None)
    try:
        response = await client.get("/api/documents/")
        assert response.status_code == 401
    finally:
        if previous is not None:
            app.dependency_overrides[require_auth] = previous
