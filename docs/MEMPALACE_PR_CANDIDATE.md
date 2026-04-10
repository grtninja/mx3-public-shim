# MemPalace PR candidate

## Goal

Offer a narrow, high-trust upstream contribution that demonstrates how a MemryX-backed local lane can assist MemPalace without changing its core storage architecture.

## Recommended upstream scope

New files only:

- `examples/mx3_shim_chroma_accel.py`
- `examples/mx3_shim_chroma_accel.md`

## Why this scope

- avoids current backend, CLI, Windows, and MCP collision lanes
- should fit MemPalace CI because it does not alter package internals or dependency wiring
- is easy for maintainers to review
- gives them a concrete accelerator-friendly integration path centered on Chroma

## Demo shape

1. Use a local OpenAI-compatible embeddings endpoint.
2. Store vectors in Chroma via `embeddings=` during ingest.
3. Query through `query_embeddings=`.
4. Keep the example honest about model consistency and optional hardware acceleration.

## Public offer pairing

The PR candidate can mention two offer surfaces:

1. `mx3-public-shim`
   A small public-safe repo candidate for local accelerator integration.
2. a reusable PR protocol
   The same safety, docs, and CI discipline used for this contribution.
