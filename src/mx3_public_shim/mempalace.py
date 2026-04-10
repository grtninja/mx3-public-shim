from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, replace
from math import sqrt
from typing import Any

from .runtime import LocalRuntime


@dataclass(slots=True)
class SearchHit:
    id: str
    text: str
    metadata: dict[str, Any]
    distance: float | None = None
    score: float | None = None


class Mx3ChromaEmbeddingFunction:
    def __init__(self, runtime: LocalRuntime, *, model: str | None = None) -> None:
        self._runtime = runtime
        self._model = model

    def __call__(self, input: Sequence[str]) -> list[list[float]]:
        texts = [str(item) for item in input]
        return self._runtime.embed(texts, model=self._model)


def _cosine_similarity(left: Sequence[float], right: Sequence[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right, strict=True))
    left_mag = sqrt(sum(a * a for a in left))
    right_mag = sqrt(sum(b * b for b in right))
    if left_mag == 0.0 or right_mag == 0.0:
        return 0.0
    return dot / (left_mag * right_mag)


def rerank_search_hits(
    query: str,
    hits: Sequence[SearchHit],
    runtime: LocalRuntime,
    *,
    model: str | None = None,
) -> list[SearchHit]:
    if not hits:
        return []
    query_vector = runtime.embed([query], model=model)[0]
    doc_vectors = runtime.embed([hit.text for hit in hits], model=model)
    reranked = []
    for hit, doc_vector in zip(hits, doc_vectors, strict=True):
        score = _cosine_similarity(query_vector, doc_vector)
        reranked.append(replace(hit, score=score))
    return sorted(
        reranked, key=lambda item: item.score if item.score is not None else -1.0, reverse=True
    )


def chroma_query_to_hits(result: dict[str, Any]) -> list[SearchHit]:
    ids = result.get("ids", [[]])
    documents = result.get("documents", [[]])
    metadatas = result.get("metadatas", [[]])
    distances = result.get("distances", [[]])
    hits: list[SearchHit] = []
    for identifier, document, metadata, distance in zip(
        ids[0] if ids else [],
        documents[0] if documents else [],
        metadatas[0] if metadatas else [],
        distances[0] if distances else [],
        strict=False,
    ):
        hits.append(
            SearchHit(
                id=str(identifier),
                text=str(document),
                metadata=dict(metadata or {}),
                distance=float(distance) if distance is not None else None,
            )
        )
    return hits
