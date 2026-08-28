from pathlib import Path

from mx3_public_shim.config import Settings

ROOT = Path(__file__).resolve().parents[1]


def test_default_openai_compat_route_targets_direct_lm_studio(monkeypatch):
    monkeypatch.delenv("MX3_PUBLIC_SHIM_OPENAI_BASE_URL", raising=False)

    assert Settings.from_env().openai_base_url == "http://127.0.0.1:1234/v1"


def test_public_docs_distinguish_lm_studio_from_mx3_support():
    docs = "\n".join(
        (ROOT / path).read_text(encoding="utf-8")
        for path in (
            "README.md",
            "CONTRIBUTING.md",
            "docs/AGENT_QUICKSTART.md",
            "docs/HUMAN_QUICKSTART.md",
            "docs/PUBLIC_BOUNDARIES.md",
            "docs/UI_VALUE_NOTES.md",
        )
    )

    assert "http://127.0.0.1:1234/v1" in docs
    assert "MX3 support-only" in docs
    assert "http://127.0.0.1:9000/v1" not in docs


def test_frontend_labels_model_and_support_routes_separately():
    frontend = (ROOT / "src/mx3_public_shim/frontend/app.js").read_text(encoding="utf-8")

    assert "LM Studio: 127.0.0.1:1234/v1" in frontend
    assert "MX3 support: 127.0.0.1:9000" in frontend
    assert "Inference: 127.0.0.1:9000/v1" not in frontend
