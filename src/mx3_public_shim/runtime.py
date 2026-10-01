from __future__ import annotations

import logging
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from typing import Any

from .config import Settings
from .providers import CPUReferenceProvider, MX3LinuxProvider, OpenAICompatProvider
from .providers.base import BaseProvider, ProviderStatus

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class SelectedProvider:
    capability: str
    provider: str


class LocalRuntime:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or Settings.from_env()
        self._providers: dict[str, BaseProvider] = {
            "mx3_linux": MX3LinuxProvider(self.settings),
            "openai_compat": OpenAICompatProvider(self.settings),
            "cpu_reference": CPUReferenceProvider(self.settings),
        }

    def provider_statuses(self) -> list[ProviderStatus]:
        return [self._providers[name].status() for name in self._providers]

    def _providers_for(self, capability: str) -> list[BaseProvider]:
        providers: list[BaseProvider] = []
        for name in self.settings.provider_order:
            provider = self._providers.get(name)
            if provider is None:
                continue
            status = provider.status()
            supported = (
                status.supports_embeddings if capability == "embeddings" else status.supports_chat
            )
            if status.available and supported:
                providers.append(provider)
        return providers

    def _select_provider(self, capability: str) -> BaseProvider:
        providers = self._providers_for(capability)
        if not providers:
            raise RuntimeError(f"No provider available for capability={capability}")
        return providers[0]

    def selected_providers(self) -> list[SelectedProvider]:
        selections: list[SelectedProvider] = []
        for capability in ("embeddings", "chat"):
            try:
                provider = self._select_provider(capability)
            except RuntimeError:
                continue
            selections.append(SelectedProvider(capability=capability, provider=provider.name))
        return selections

    def embed(self, texts: Iterable[str], model: str | None = None) -> list[list[float]]:
        # Provider chain: try each capable provider in order, falling through
        # on failure so the deterministic CPU reference answers when the
        # configured endpoint is unreachable. (Muse)
        errors: list[str] = []
        for provider in self._providers_for("embeddings"):
            try:
                return provider.embed(list(texts), model=model)
            except Exception as exc:  # noqa: BLE001 - chain falls through to next provider
                logger.warning("embeddings provider %s failed, trying next: %s", provider.name, exc)
                errors.append(f"{provider.name}: {exc}")
        detail = "; ".join(errors) or "none available"
        raise RuntimeError(f"All embedding providers failed: {detail}")

    def generate(
        self,
        prompt: str,
        *,
        model: str | None = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
    ) -> str:
        # Provider chain: fall through on failure like embed(). (Muse)
        errors: list[str] = []
        for provider in self._providers_for("chat"):
            try:
                return provider.generate(
                    prompt,
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
            except Exception as exc:  # noqa: BLE001 - chain falls through to next provider
                logger.warning("chat provider %s failed, trying next: %s", provider.name, exc)
                errors.append(f"{provider.name}: {exc}")
        detail = "; ".join(errors) or "none available"
        raise RuntimeError(f"All chat providers failed: {detail}")

    def chat(
        self,
        messages: list[dict[str, Any]],
        *,
        model: str | None = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
    ) -> str:
        prompt_parts: list[str] = []
        for message in messages:
            role = str(message.get("role", "user"))
            content = str(message.get("content", ""))
            prompt_parts.append(f"[{role}] {content}")
        prompt = "\n".join(prompt_parts)
        return self.generate(
            prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    def status_report(self) -> dict[str, Any]:
        return {
            "provider_order": list(self.settings.provider_order),
            "providers": [asdict(status) for status in self.provider_statuses()],
            "selected": [asdict(selection) for selection in self.selected_providers()],
        }
