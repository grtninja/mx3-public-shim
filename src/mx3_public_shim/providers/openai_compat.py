from __future__ import annotations

import json
from typing import Any
from urllib import request

from ..config import Settings
from .base import BaseProvider, ProviderStatus


class OpenAICompatProvider(BaseProvider):
    name = "openai_compat"
    supports_chat = True
    supports_embeddings = True

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def status(self) -> ProviderStatus:
        configured = bool(self._settings.openai_base_url)
        detail = "configured" if configured else "missing-base-url"
        metadata: dict[str, Any] = {
            "base_url": self._settings.openai_base_url,
            "intended_for": "local-mx3-backed-openai-compatible-endpoints",
        }
        return ProviderStatus(
            name=self.name,
            available=configured,
            supports_chat=True,
            supports_embeddings=True,
            detail=detail,
            metadata=metadata,
        )

    def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self._settings.openai_base_url:
            raise RuntimeError("MX3_PUBLIC_SHIM_OPENAI_BASE_URL is not configured")
        url = f"{self._settings.openai_base_url.rstrip('/')}" + path
        data = json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if self._settings.openai_api_key:
            headers["Authorization"] = f"Bearer {self._settings.openai_api_key}"
        req = request.Request(url=url, data=data, headers=headers, method="POST")
        with request.urlopen(req, timeout=self._settings.request_timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))

    def embed(self, texts: list[str], model: str | None = None) -> list[list[float]]:
        payload = {
            "model": model or self._settings.embedding_model,
            "input": texts,
        }
        body = self._post("/embeddings", payload)
        return [row["embedding"] for row in body.get("data", [])]

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
    ) -> str:
        payload = {
            "model": model or self._settings.chat_model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        body = self._post("/chat/completions", payload)
        choices = body.get("choices", [])
        if not choices:
            raise RuntimeError("OpenAI-compatible response did not include choices")
        message = choices[0].get("message", {})
        return str(message.get("content", ""))
