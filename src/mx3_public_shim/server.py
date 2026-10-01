from __future__ import annotations

from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from .config import Settings
from .doctor import build_doctor_report
from .runtime import LocalRuntime

FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"


def build_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or Settings.from_env()
    runtime = LocalRuntime(resolved)
    app = FastAPI(title=resolved.frontend_title)
    # The bundled desktop shell loads the frontend from file:// and calls back
    # here. This service binds loopback only, so permissive CORS is safe and
    # required for the documented desktop path to work.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Accept", "Authorization"],
    )

    @app.get("/")
    def root() -> FileResponse:
        return FileResponse(FRONTEND_DIR / "index.html")

    @app.get("/styles.css")
    def styles() -> FileResponse:
        return FileResponse(FRONTEND_DIR / "styles.css")

    @app.get("/app.js")
    def app_js() -> FileResponse:
        return FileResponse(FRONTEND_DIR / "app.js")

    @app.get("/healthz")
    def healthz() -> JSONResponse:
        return JSONResponse(build_doctor_report(resolved))

    @app.get("/api/provider-status")
    def provider_status() -> dict[str, Any]:
        return runtime.status_report()

    @app.get("/v1/models")
    def models() -> dict[str, Any]:
        data = [
            {
                "id": resolved.chat_model,
                "object": "model",
                "capability": "chat",
            },
            {
                "id": resolved.embedding_model,
                "object": "model",
                "capability": "embeddings",
            },
        ]
        return {"object": "list", "data": data}

    @app.post("/v1/embeddings")
    async def embeddings(request: Request) -> dict[str, Any]:
        payload = await request.json()
        raw_input = payload.get("input", [])
        texts = raw_input if isinstance(raw_input, list) else [raw_input]
        vectors = runtime.embed([str(item) for item in texts], model=payload.get("model"))
        return {
            "object": "list",
            "data": [
                {"object": "embedding", "embedding": vector, "index": index}
                for index, vector in enumerate(vectors)
            ],
            "model": payload.get("model") or resolved.embedding_model,
        }

    @app.post("/v1/chat/completions")
    async def chat_completions(request: Request) -> dict[str, Any]:
        # Reconciliation note: the private shim retired chat from its own
        # surface (410 Gone — "use the PAIR front door :1234"). The public
        # shim keeps this route as a thin forward to the operator's configured
        # OpenAI-compatible endpoint, which defaults to LM Studio at
        # http://127.0.0.1:1234/v1 — the same destination. The shim never
        # serves chat itself; without a configured endpoint the deterministic
        # CPU reference answers so the route stays testable offline.
        payload = await request.json()
        content = runtime.chat(
            payload.get("messages", []),
            model=payload.get("model"),
            max_tokens=int(payload.get("max_tokens", 256)),
            temperature=float(payload.get("temperature", 0.2)),
        )
        return {
            "id": "mx3-public-shim-chat",
            "object": "chat.completion",
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }
            ],
            "model": payload.get("model") or resolved.chat_model,
        }

    return app


def main() -> None:
    uvicorn.run(build_app(), host="127.0.0.1", port=9015, log_level="info")


if __name__ == "__main__":
    main()
