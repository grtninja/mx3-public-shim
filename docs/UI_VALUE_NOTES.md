# UI value notes

This glossary describes the visible values in the public status UI.

## Status pills

- `Chat provider chain`: which provider answers `POST /v1/chat/completions` — `mx3_linux`, `openai_compat` (your LM Studio at `127.0.0.1:1234/v1` by default), or `cpu_reference`.
- `Embeddings provider chain`: which provider answers `POST /v1/embeddings` — same chain, same order.
- `Device`: MX3 runtime visibility. Reports unavailable without the official MemryX Python runtime and hardware on Linux.
- `Shipped backend status`: this repository's backend on `127.0.0.1:9015`.

## Quick Start

- The documented first-use path: start the backend, open the status page, confirm the pills are green.

## Configuration & Checks

- Current settings: provider order, model names, embedding dimensions, timeout.
- `Refresh`: re-reads provider status from the backend.
- `Validate MX3`: runs the public validation check for the MX3 lane.

## Provider Detail

- Per-provider cards: availability, supported capabilities, and the reason a provider is selected or skipped.

## About

- Product identity and public-boundary summary.

## Common placeholder states

- `n/a`: no verified value is available yet.
- `Loading...`: the UI has not received the first provider report yet.
- `unknown`: state exists but is not yet verified.

(Updated to the shipped status UI by Muse.)
