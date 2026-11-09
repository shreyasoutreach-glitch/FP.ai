"""Single-workspace password gate with signed, short-lived browser sessions."""
import base64, hashlib, hmac, json, secrets, time
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()
COOKIE_NAME = "fpai_session"

class LoginRequest(BaseModel):
    password: str

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))

def _sign(payload: bytes) -> str:
    return _b64(hmac.new(settings.SECRET_KEY.encode(), payload, hashlib.sha256).digest())

def _decode_session(token: str):
    try:
        body, signature = token.split(".", 1)
        payload = _unb64(body)
        if not hmac.compare_digest(_sign(payload), signature):
            return None
        data = json.loads(payload)
        return data if int(data["exp"]) > int(time.time()) else None
    except (ValueError, TypeError, KeyError, json.JSONDecodeError):
        return None

def _validate_origin(request: Request):
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in {item.rstrip("/") for item in settings.ALLOWED_ORIGINS}:
        raise HTTPException(status_code=403, detail="Request origin is not allowed")

async def require_auth(request: Request):
    if not settings.APP_ACCESS_PASSWORD:
        raise HTTPException(status_code=503, detail="Application access is not configured")
    if settings.SECRET_KEY == "change-me-in-production" or len(settings.SECRET_KEY) < 32:
        raise HTTPException(status_code=503, detail="Application security is not configured")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        _validate_origin(request)
    session = _decode_session(request.cookies.get(COOKIE_NAME, ""))
    if not session:
        raise HTTPException(status_code=401, detail="Authentication required")
    return session

@router.post("/login")
async def login(body: LoginRequest, request: Request, response: Response):
    if not settings.APP_ACCESS_PASSWORD or settings.SECRET_KEY == "change-me-in-production" or len(settings.SECRET_KEY) < 32:
        raise HTTPException(status_code=503, detail="Application security is not configured")
    _validate_origin(request)
    if not hmac.compare_digest(body.password.encode(), settings.APP_ACCESS_PASSWORD.encode()):
        raise HTTPException(status_code=401, detail="Incorrect access password")
    expires = int(time.time()) + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    payload = json.dumps({"exp": expires, "nonce": secrets.token_urlsafe(12)}, separators=(",", ":")).encode()
    token = _b64(payload) + "." + _sign(payload)
    response.set_cookie(COOKIE_NAME, token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                        httponly=True, secure=True, samesite="none", path="/")
    return {"authenticated": True, "expires_at": expires}

@router.get("/session")
async def session_status(session=Depends(require_auth)):
    return {"authenticated": True, "expires_at": session["exp"]}

@router.post("/logout")
async def logout(response: Response, request: Request):
    _validate_origin(request)
    response.delete_cookie(COOKIE_NAME, path="/", secure=True, httponly=True, samesite="none")
    return {"authenticated": False}
