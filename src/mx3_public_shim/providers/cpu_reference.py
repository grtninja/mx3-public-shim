from __future__ import annotations

import hashlib

from ..config import Settings
from .base import BaseProvider, ProviderStatus


class CPUReferenceProvider(BaseProvider):
    name = "cpu_reference"
    supports_chat = True
    supports_embeddings = True

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def status(self) -> ProviderStatus:
        return ProviderStatus(
            name=self.name,
            available=True,
            supports_chat=True,
            supports_embeddings=True,
            detail="deterministic-ci-fallback",
            metadata={"dimensions": self._settings.cpu_embedding_dimensions},
        )

    def embed(self, texts: list[str], model: str | None = None) -> list[list[float]]:
        dims = self._settings.cpu_embedding_dimensions
        payload: list[list[float]] = []
        for text in texts:
            digest = hashlib.sha256(text.encode("utf-8")).digest()
            vector = []
            for index in range(dims):
                byte = digest[index % len(digest)]
                vector.append((byte / 127.5) - 1.0)
            payload.append(vector)
        return payload

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
    ) -> str:
        preview = " ".join(prompt.split())[: max_tokens * 2].strip()
        return f"cpu-reference: {preview}" if preview else "cpu-reference: (empty prompt)"
