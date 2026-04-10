from __future__ import annotations

import os
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(slots=True)
class Settings:
    provider_order: tuple[str, ...] = ("mx3_linux", "openai_compat", "cpu_reference")
    openai_base_url: str | None = "http://127.0.0.1:9000/v1"
    openai_api_key: str | None = None
    chat_model: str = "huihui-qwen3.5-27b-abliterated"
    embedding_model: str = "text-embedding-nomic-embed-text-v1.5"
    mx3_embed_dfp: str | None = None
    request_timeout_seconds: float = 20.0
    cpu_embedding_dimensions: int = 16
    frontend_title: str = "MX3 Public Shim"

    @classmethod
    def from_env(cls) -> Settings:
        provider_order_raw = os.getenv(
            "MX3_PUBLIC_SHIM_PROVIDER_ORDER", "mx3_linux,openai_compat,cpu_reference"
        )
        provider_order = tuple(
            segment.strip() for segment in provider_order_raw.split(",") if segment.strip()
        )
        return cls(
            provider_order=provider_order or cls.provider_order,
            openai_base_url=os.getenv(
                "MX3_PUBLIC_SHIM_OPENAI_BASE_URL", "http://127.0.0.1:9000/v1"
            ),
            openai_api_key=os.getenv("MX3_PUBLIC_SHIM_OPENAI_API_KEY"),
            chat_model=os.getenv("MX3_PUBLIC_SHIM_CHAT_MODEL", "huihui-qwen3.5-27b-abliterated"),
            embedding_model=os.getenv(
                "MX3_PUBLIC_SHIM_EMBED_MODEL", "text-embedding-nomic-embed-text-v1.5"
            ),
            mx3_embed_dfp=os.getenv("MX3_PUBLIC_SHIM_EMBED_DFP"),
            request_timeout_seconds=float(
                os.getenv("MX3_PUBLIC_SHIM_REQUEST_TIMEOUT_SECONDS", "20")
            ),
            cpu_embedding_dimensions=int(os.getenv("MX3_PUBLIC_SHIM_CPU_EMBED_DIMS", "16")),
            frontend_title=os.getenv("MX3_PUBLIC_SHIM_FRONTEND_TITLE", "MX3 Public Shim"),
        )

    def public_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["openai_api_key"] = "configured" if self.openai_api_key else None
        return payload
