# MemPalace correlation

## Where the overlap is real

MemPalace validated several things that align tightly with the MX3 public shim story:

1. Local-first memory beats cloud-dependent memory for trust and cost.
2. Chroma-backed retrieval is a practical seam for acceleration.
3. Wake-up context and retrieval economy matter more than ornate abstractions.
4. Memory infrastructure is most useful when it is explicit and operator-readable.

## What this app contributes

This app does not try to replace MemPalace.

It contributes a clean acceleration seam around the expensive parts that MemPalace already depends on:

- embeddings for Chroma ingest and query
- optional rerank after retrieval
- honest local hardware proof and accounting

## Why Chroma is the seam

MemPalace already stores and queries over a Chroma collection. That makes an embedding-function adapter and a rerank helper the highest-value, lowest-conflict contribution lane.

## Why that matters

If those two seams improve, MemPalace can keep its existing structure while gaining:

1. faster local vector work
2. clearer proof that MX3 hardware is actually being used
3. better operator visibility into latency, efficiency, and feeder state

## What stays out of scope

- rewriting MemPalace's taxonomy
- replacing its memory model
- touching its MCP tool family wholesale
- making benchmark claims the code cannot defend
- pretending unsupported MemryX runtime paths are shipped
