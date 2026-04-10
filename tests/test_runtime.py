from mx3_public_shim.config import Settings
from mx3_public_shim.runtime import LocalRuntime


def test_runtime_cpu_fallback_generates_embeddings_and_chat():
    runtime = LocalRuntime(
        Settings(
            provider_order=("cpu_reference",),
            openai_base_url=None,
            cpu_embedding_dimensions=12,
        )
    )

    vectors = runtime.embed(["hello world"])
    reply = runtime.chat([{"role": "user", "content": "Say hi"}])
    status = runtime.status_report()

    assert len(vectors) == 1
    assert len(vectors[0]) == 12
    assert reply.startswith("cpu-reference:")
    assert status["selected"][0]["provider"] == "cpu_reference"


def test_runtime_status_lists_boundaries():
    runtime = LocalRuntime(
        Settings(provider_order=("mx3_linux", "cpu_reference"), openai_base_url=None)
    )

    providers = runtime.status_report()["providers"]
    names = {row["name"]: row for row in providers}

    assert "mx3_linux" in names
    assert "cpu_reference" in names
