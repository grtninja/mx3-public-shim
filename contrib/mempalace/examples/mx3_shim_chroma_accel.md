# MX3 shim Chroma acceleration demo

This example keeps MemPalace's core logic unchanged and demonstrates a narrow accelerator-friendly seam:

1. call a local OpenAI-compatible embeddings endpoint
2. pass those vectors into Chroma at ingest time with `embeddings=`
3. pass query vectors into Chroma at search time with `query_embeddings=`

## Why this shape is safe

- no MemPalace backend changes
- no MCP changes
- no benchmark claims
- examples-only blast radius

## Requirements

- a running OpenAI-compatible embeddings endpoint
- a single embedding model used consistently for both ingest and query
- `chromadb` installed locally

A MemryX-backed local shim is one valid endpoint, but the example stays generic enough to work with any compatible local embedding server.
