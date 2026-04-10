from mx3_public_shim.config import Settings


def test_settings_from_env(monkeypatch):
    monkeypatch.setenv("MX3_PUBLIC_SHIM_PROVIDER_ORDER", "cpu_reference,openai_compat")
    monkeypatch.setenv("MX3_PUBLIC_SHIM_OPENAI_BASE_URL", "http://127.0.0.1:9999/v1")
    monkeypatch.setenv("MX3_PUBLIC_SHIM_CPU_EMBED_DIMS", "8")

    settings = Settings.from_env()

    assert settings.provider_order == ("cpu_reference", "openai_compat")
    assert settings.openai_base_url == "http://127.0.0.1:9999/v1"
    assert settings.cpu_embedding_dimensions == 8


def test_public_dict_redacts_api_key(monkeypatch):
    monkeypatch.setenv("MX3_PUBLIC_SHIM_OPENAI_API_KEY", "secret-token")

    settings = Settings.from_env()

    assert settings.public_dict()["openai_api_key"] == "configured"
