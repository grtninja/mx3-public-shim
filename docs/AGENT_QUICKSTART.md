# Agent quick start

## Mission

Apply high effort and thorough reasoning. Complete the requested public MX3 workflow across every task-relevant backend, device, DFP, feeder, telemetry, desktop, test, package, and documentation surface. Preserve public safety, hardware truth, user state, and exact evidence.

## Runtime roles

1. `http://127.0.0.1:9015` is this repository's backend: status UI plus
   `/healthz`, `/api/provider-status`, `/v1/models`, `/v1/embeddings`,
   `/v1/chat/completions`.
2. `http://127.0.0.1:1234/v1` is the direct LM Studio model endpoint (the
   operator's model host; chat and OpenAI-compatible embeddings route here
   by default).

The private-workstation MX3 support-only service (`:9000`) and manager
boundary (`:10000`) are not part of this repository. This app does not call
them; do not add calls to them. The selected model host owns
language-model loading and residency. (Muse)

## Operating rules

- Keep the Electron shell frontend-only; it must not start, stop, rebind, or implicitly bounce backend runtime services.
- Treat this public app as an embeddings + chat-routing surface over its own bundled backend.
- Keep model loading and residency with direct LM Studio at `http://127.0.0.1:1234/v1`; do not invent model state from provider-chain status.
- Do not claim that MX3 hardware is live unless the provider report shows the `mx3_linux` provider available with a real device.

## Complete workflow

1. Read `README.md`, `CONTRIBUTING.md`, and `docs/PUBLIC_BOUNDARIES.md`.
2. Bind the exact request, repository head, provider chain order, physical or fixture device class, output, and acceptance criteria.
3. Verify backend health (`/healthz`), provider status (`/api/provider-status`), and the documented first-use path (`POST /v1/embeddings`) before changing behavior.
4. Implement the complete correction across source, tests, package metadata, and public documentation.
5. Keep model-host operations within the selected model runtime and MX3 operations within this repo's backend.
6. Run the complete validation matrix and public hygiene checks.
7. Record current exact-head evidence and the exact continuation step for each genuine external dependency. (Muse)

## Hardware and telemetry evidence

A physical-hardware acceptance packet includes:

- current device identity and count;
- provider-chain selection showing `mx3_linux` available;
- embedding output from the MX3 path;
- process and listener ownership;
- visible status-UI result.

Development fixtures remain explicitly labeled as fixtures and carry synthetic provenance. (Muse)

## Public boundary

Keep release-facing source, documentation, UI copy, and examples safe for public release, standalone, repository-relative, source-attributable, and free of private credentials or workstation topology. Use official upstream references and current public product terminology.

## Validation

```bash
python tools/check_public_repo_hygiene.py
pytest -q
ruff check .
ruff format --check .
npm test --if-present
npm run build --if-present
```

## Completion

The task is complete when the requested public product outcome works, every affected surface is synchronized, hardware and process evidence is truthful, public hygiene passes, the visible workflow succeeds, and each external dependency has a precise continuation path.
