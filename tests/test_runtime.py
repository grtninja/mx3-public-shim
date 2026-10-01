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


def test_runtime_falls_through_unreachable_openai_compat_to_cpu_reference():
    # The default provider_order puts openai_compat first. With no LM Studio
    # reachable at :1234, embed() and chat() must fall through to the
    # deterministic CPU reference instead of raising. (Muse)
    runtime = LocalRuntime(
        Settings(
            provider_order=("openai_compat", "cpu_reference"),
            openai_base_url="http://127.0.0.1:1/v1",  # nothing listens here
            request_timeout_seconds=1.0,
            cpu_embedding_dimensions=12,
        )
    )

    vectors = runtime.embed(["hello world"])
    reply = runtime.chat([{"role": "user", "content": "Say hi"}])

    assert len(vectors) == 1
    assert len(vectors[0]) == 12
    assert reply.startswith("cpu-reference:")
