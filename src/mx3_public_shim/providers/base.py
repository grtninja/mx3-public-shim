from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class ProviderStatus:
    name: str
    available: bool
    supports_chat: bool
    supports_embeddings: bool
    detail: str
    metadata: dict[str, Any]


class BaseProvider:
    name = "base"
    supports_chat = False
    supports_embeddings = False

    def status(self) -> ProviderStatus:
        raise NotImplementedError

    def embed(self, texts: list[str], model: str | None = None) -> list[list[float]]:
        raise NotImplementedError

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
    ) -> str:
        raise NotImplementedError
