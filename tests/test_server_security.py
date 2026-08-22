from fastapi.testclient import TestClient

from mx3_public_shim.config import Settings
from mx3_public_shim.server import build_app


def _client() -> TestClient:
    app = build_app(
        Settings(
            provider_order=("cpu_reference",),
            openai_base_url=None,
            api_token="unit-test-token",
        )
    )
    return TestClient(app)


def test_read_only_health_stays_available_without_token():
    client = _client()

    response = client.get("/healthz")

    assert response.status_code == 200


def test_mutation_routes_require_bearer_token():
    client = _client()
    payload = {"messages": [{"role": "user", "content": "Say hi"}]}

    blocked = client.post("/v1/chat/completions", json=payload)
    allowed = client.post(
        "/v1/chat/completions",
        json=payload,
        headers={"Authorization": "Bearer unit-test-token"},
    )

    assert blocked.status_code == 401
    assert blocked.json()["error"] == "auth_required"
    assert allowed.status_code == 200
    assert allowed.json()["choices"][0]["message"]["content"].startswith("cpu-reference:")


def test_browser_root_issues_http_only_same_site_session_cookie():
    client = _client()

    root = client.get("/")
    allowed = client.post(
        "/v1/chat/completions",
        json={"messages": [{"role": "user", "content": "Say hi"}]},
    )

    assert root.status_code == 200
    cookie = root.headers["set-cookie"].lower()
    assert "mx3_public_shim_session=" in cookie
    assert "httponly" in cookie
    assert "samesite=strict" in cookie
    assert allowed.status_code == 200


def test_cross_origin_and_null_origin_posts_are_rejected_even_with_token():
    client = _client()
    payload = {"input": "hello"}
    headers = {"Authorization": "Bearer unit-test-token"}

    external = client.post(
        "/v1/embeddings",
        json=payload,
        headers={**headers, "Origin": "https://example.com"},
    )
    null_origin = client.post(
        "/v1/embeddings",
        json=payload,
        headers={**headers, "Origin": "null"},
    )

    assert external.status_code == 403
    assert null_origin.status_code == 403


def test_loopback_preflight_advertises_authorization_header():
    client = _client()

    allowed = client.options(
        "/v1/chat/completions",
        headers={"Origin": "http://127.0.0.1:5173"},
    )
    blocked = client.options(
        "/v1/chat/completions",
        headers={"Origin": "null"},
    )

    assert allowed.status_code == 204
    assert allowed.headers["Access-Control-Allow-Origin"] == "http://127.0.0.1:5173"
    assert "Authorization" in allowed.headers["Access-Control-Allow-Headers"]
    assert blocked.status_code == 403
