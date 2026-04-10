# MemPalace correlation

## Direct overlap

MemPalace validated several things that align tightly with the MX3 public shim story:

1. Local-first memory beats cloud-dependent memory for trust and cost.
2. Chroma-backed retrieval is a practical seam for acceleration.
3. Wake-up context and retrieval economy matter more than ornate abstractions.
4. Memory infrastructure is most useful when it is explicit and operator-readable.

## What this candidate contributes back

This public shim candidate does not try to replace MemPalace.

It contributes a clean acceleration seam around the expensive parts that MemPalace already validates:

- embeddings for Chroma ingest and query
- optional rerank after retrieval
- honest local hardware accounting posture

## Why Chroma is the seam

MemPalace already stores and queries over a Chroma collection. That makes an embedding-function adapter and a rerank helper the highest-value, lowest-conflict contribution lane.

## What stays out of scope

- rewriting MemPalace's taxonomy
- touching its MCP tool family wholesale
- making benchmark claims the code cannot defend
- pretending unsupported MemryX runtime paths are shipped
