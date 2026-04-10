from __future__ import annotations

from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse

from .config import Settings
from .doctor import build_doctor_report
from .runtime import LocalRuntime

FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"


def build_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or Settings.from_env()
    runtime = LocalRuntime(resolved)
    app = FastAPI(title=resolved.frontend_title)

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
