# Human quickstart

## What this app is

A small local backend plus a bundled status UI. It serves local embeddings
over `POST /v1/embeddings` through a provider chain (direct MX3 runtime on
Linux, your own LM Studio, or a deterministic CPU reference), and forwards
`POST /v1/chat/completions` to your configured OpenAI-compatible endpoint
(LM Studio at `http://127.0.0.1:1234/v1` by default). The status UI shows the
live provider chain, device state, and configuration.

## Hardware requirement

MX3 hardware is optional. Without a MemryX AI Accelerator on Linux, the
chain falls through to LM Studio or the deterministic CPU reference, and the
device panel reports the runtime as unavailable. (Muse)

## First-use path

1. Start the backend: `python -m mx3_public_shim.server`.
2. Open `http://127.0.0.1:9015` — the backend status pill should read green.
3. Confirm the provider chain shows which provider answers embeddings and chat.
4. Use LM Studio directly at `http://127.0.0.1:1234/v1` for model loading and inference.

## What to confirm in the UI

- `Chat provider chain`: which provider answers `POST /v1/chat/completions`.
- `Embeddings provider chain`: which provider answers `POST /v1/embeddings`.
- `Device`: MX3 runtime visibility (unavailable without hardware/driver on Linux).
- `Shipped backend status`: this repo's backend on `127.0.0.1:9015`.

## What this app controls

- The local embeddings route and provider chain order.
- The chat forward target (`MX3_PUBLIC_SHIM_OPENAI_BASE_URL`).

## What this app does not control

- LM model loading. That belongs to LM Studio or the operator's chosen inference host.
- Vendor firmware updates.
- Private workstation-only services (`:9000` MX3 support, `:10000` manager boundary) — they are not part of this repository and this app does not call them.
