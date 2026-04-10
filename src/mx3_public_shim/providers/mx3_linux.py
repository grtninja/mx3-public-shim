from __future__ import annotations

import platform
from pathlib import Path
from typing import Any

from ..config import Settings
from .base import BaseProvider, ProviderStatus


class MX3LinuxProvider(BaseProvider):
    name = "mx3_linux"
    supports_chat = False
    supports_embeddings = True

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def status(self) -> ProviderStatus:
        system = platform.system().lower()
        metadata: dict[str, Any] = {
            "system": system,
            "dfp": self._settings.mx3_embed_dfp,
            "boundary": "official-python-runtime-is-linux-only",
        }
        if system == "windows":
            return ProviderStatus(
                name=self.name,
                available=False,
                supports_chat=False,
                supports_embeddings=True,
                detail="windows-python-runtime-unsupported-by-official-docs",
                metadata=metadata,
            )
        if system != "linux":
            return ProviderStatus(
                name=self.name,
                available=False,
                supports_chat=False,
                supports_embeddings=True,
                detail="non-linux-platform",
                metadata=metadata,
            )
        try:
            from memryx import SyncAccl  # type: ignore
        except Exception:
            return ProviderStatus(
                name=self.name,
                available=False,
                supports_chat=False,
                supports_embeddings=True,
                detail="memryx-python-runtime-not-installed",
                metadata=metadata,
            )
        if not self._settings.mx3_embed_dfp:
            return ProviderStatus(
                name=self.name,
                available=False,
                supports_chat=False,
                supports_embeddings=True,
                detail="set-MX3_PUBLIC_SHIM_EMBED_DFP-for-direct-linux-runtime",
                metadata=metadata,
            )
        if not Path(self._settings.mx3_embed_dfp).exists():
            return ProviderStatus(
                name=self.name,
                available=False,
                supports_chat=False,
                supports_embeddings=True,
                detail="configured-dfp-path-does-not-exist",
                metadata=metadata,
            )
        return ProviderStatus(
            name=self.name,
            available=True,
            supports_chat=False,
            supports_embeddings=True,
            detail="linux-runtime-visible-model-specific-tensor-adapter-still-required",
            metadata={**metadata, "runtime_class": SyncAccl.__name__},
        )

    def embed(self, texts: list[str], model: str | None = None) -> list[list[float]]:
        raise NotImplementedError(
            "Direct Linux MX3 execution is only enabled once a model-specific tensor "
            "adapter is provided. Use the OpenAI-compatible local hardware endpoint "
            "for immediate end-to-end use, or wire a direct adapter for your "
            "compiled embedding DFP."
        )
