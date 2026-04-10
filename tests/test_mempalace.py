from mx3_public_shim.config import Settings
from mx3_public_shim.mempalace import Mx3ChromaEmbeddingFunction, SearchHit, rerank_search_hits
from mx3_public_shim.runtime import LocalRuntime


class FakeRuntime:
    def __init__(self, mapping):
        self.mapping = mapping

    def embed(self, texts, model=None):
        return [self.mapping[text] for text in texts]


def test_rerank_search_hits_prefers_more_similar_document():
    runtime = FakeRuntime(
        {
            "gpu budget": [1.0, 0.0],
            "document about gpu budget": [0.9, 0.1],
            "document about gardening": [0.0, 1.0],
        }
    )
    hits = [
        SearchHit(id="a", text="document about gardening", metadata={}),
        SearchHit(id="b", text="document about gpu budget", metadata={}),
    ]

    reranked = rerank_search_hits("gpu budget", hits, runtime)

    assert reranked[0].id == "b"
    assert reranked[1].id == "a"


def test_chroma_embedding_function_delegates_to_runtime():
    runtime = LocalRuntime(Settings(provider_order=("cpu_reference",), openai_base_url=None))
    embedding_fn = Mx3ChromaEmbeddingFunction(runtime)

    vectors = embedding_fn(["alpha", "beta"])

    assert len(vectors) == 2
    assert len(vectors[0]) == runtime.settings.cpu_embedding_dimensions
