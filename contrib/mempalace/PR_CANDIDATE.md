# Candidate upstream PR for `milla-jovovich/mempalace`

## Proposed files

- `examples/mx3_shim_chroma_accel.py`
- `examples/mx3_shim_chroma_accel.md`

## Intent

Show how MemPalace's existing Chroma-backed retrieval can be paired with a local accelerator-friendly embeddings lane without changing MemPalace internals.

## Why it should merge cleanly

- examples-only scope
- no dependency changes required for MemPalace core
- no overlap with current backend, Qdrant, CLI, Windows, or MCP error-path PRs
- no conflict with CI beyond standard Python lint and format checks on the new example file

## Review posture

This PR should be framed as:

- optional
- local-first
- no hype
- honest about platform boundaries

## Suggested PR body outline

- problem: local retrieval acceleration is useful, but the safe contribution seam is the example layer
- change: add one Python demo and one markdown explainer
- blast radius: examples only
- verification: local example run; existing MemPalace CI remains unaffected
