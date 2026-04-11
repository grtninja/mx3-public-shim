from __future__ import annotations

import tempfile
from pathlib import Path

try:
    from chromadb import PersistentClient
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Install the optional mempalace extra: pip install -e .[mempalace]") from exc

from mx3_public_shim.config import Settings
from mx3_public_shim.mempalace import (
    Mx3ChromaEmbeddingFunction,
    chroma_query_to_hits,
    rerank_search_hits,
)
from mx3_public_shim.runtime import LocalRuntime


def main() -> None:
    runtime = LocalRuntime(Settings(provider_order=("cpu_reference",), openai_base_url=None))
    embedding_fn = Mx3ChromaEmbeddingFunction(runtime)

    with tempfile.TemporaryDirectory() as tmpdir:
        client = PersistentClient(path=str(Path(tmpdir)))
        collection = client.get_or_create_collection(
            "mempalace_drawers",
            embedding_function=embedding_fn,
        )
        collection.add(
            ids=["1", "2", "3"],
            documents=[
                "The local stack keeps a verification queue for notes that need confirmation.",
                "The workstation stores a short MX3 setup checklist for repeatable bring-up.",
                "A gardening notebook with watering reminders.",
            ],
            metadatas=[
                {"wing": "verification"},
                {"wing": "operations"},
                {"wing": "personal"},
            ],
        )
        raw = collection.query(
            query_texts=["How does the system track notes that need confirmation?"],
            n_results=3,
        )
        hits = chroma_query_to_hits(raw)
        reranked = rerank_search_hits(
            "How does the system track notes that need confirmation?",
            hits,
            runtime,
        )
        for hit in reranked:
            print(f"{hit.id}: score={hit.score:.4f} text={hit.text}")


if __name__ == "__main__":
    main()
