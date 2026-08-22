from __future__ import annotations

import hmac
import os
import secrets
from pathlib import Path
from urllib.parse import urlparse

from fastapi import Request
from fastapi.responses import JSONResponse, Response

from .config import Settings

TOKEN_ENV_VAR = "MX3_PUBLIC_SHIM_API_TOKEN"
SESSION_COOKIE_NAME = "mx3_public_shim_session"
_LOOPBACK_ORIGIN_HOSTS = {"127.0.0.1", "localhost", "::1"}


def _state_root() -> Path:
    local_appdata = os.environ.get("LOCALAPPDATA")
    if local_appdata:
        return Path(local_appdata) / "MX3PublicShim"
    return Path.home() / ".mx3-public-shim"


def api_token_path() -> Path:
    return _state_root() / "api-token"


def ensure_api_token(settings: Settings) -> str:
    configured = str(settings.api_token or "").strip()
    if configured:
        return configured

    path = api_token_path()
    if path.exists():
        existing = path.read_text(encoding="utf-8").strip()
        if existing:
            return existing

    path.parent.mkdir(parents=True, exist_ok=True)
    token = secrets.token_urlsafe(32)
    path.write_text(f"{token}\n", encoding="utf-8")
    try:
        path.chmod(0o600)
    except OSError:
        pass
    return token


def _origin_allowed(origin: str) -> bool:
    if not origin:
        return True
    parsed = urlparse(origin)
    host = str(parsed.hostname or "").strip().lower()
    return parsed.scheme in {"http", "https"} and host in _LOOPBACK_ORIGIN_HOSTS


def cors_headers_for_origin(origin: str) -> dict[str, str]:
    if not origin or not _origin_allowed(origin):
        return {}
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Private-Network": "true",
        "Vary": "Origin",
    }


def preflight_response(request: Request) -> Response:
    origin = str(request.headers.get("Origin", "")).strip()
    if origin and not _origin_allowed(origin):
        return JSONResponse({"error": "origin_not_allowed"}, status_code=403)
    return Response(status_code=204, headers=cors_headers_for_origin(origin))


def _bearer_token(value: object) -> str:
    text = str(value or "").strip()
    prefix = "Bearer "
    if text.lower().startswith(prefix.lower()):
        return text[len(prefix) :].strip()
    return ""


def mutation_auth_error(request: Request, settings: Settings) -> JSONResponse | None:
    origin = str(request.headers.get("Origin", "")).strip()
    if origin and not _origin_allowed(origin):
        return JSONResponse({"error": "origin_not_allowed"}, status_code=403)
    if settings.allow_unauthenticated_posts:
        return None

    expected = ensure_api_token(settings)
    supplied_bearer = _bearer_token(request.headers.get("Authorization"))
    supplied_cookie = str(request.cookies.get(SESSION_COOKIE_NAME, "")).strip()
    bearer_matches = bool(supplied_bearer) and hmac.compare_digest(supplied_bearer, expected)
    cookie_matches = bool(supplied_cookie) and hmac.compare_digest(supplied_cookie, expected)
    if not bearer_matches and not cookie_matches:
        return JSONResponse({"error": "auth_required"}, status_code=401)
    return None
