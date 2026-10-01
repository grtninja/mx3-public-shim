# Changelog

All notable changes to this project will be documented in this file.

## Unreleased - 2026-10-01

- Public coherence pass: the shipped frontend, docs, and examples now describe
  the backend this repo actually ships (`127.0.0.1:9015` with `/healthz`,
  `/api/provider-status`, `/v1/models`, `/v1/embeddings`, `/v1/chat/completions`).
  The private-workstation MX3 support service (`:9000`) and manager boundary
  (`:10000`) are explicitly out of scope — this app never called them, and the
  docs no longer claim it does.
- Provider chain now falls through on failure: unreachable `openai_compat`
  endpoint degrades to the deterministic CPU reference instead of 500ing.
- `POST /v1/chat/completions` documented as a thin forward to the operator's
  configured OpenAI-compatible endpoint (LM Studio `:1234` by default); the
  shim never serves chat itself.
- Rewrote `README.md`, quickstarts, boundaries, contributing, and UI value
  notes to match the actual first-use path; repointed the mempalace example
  at `:9015`.
- Added provider-fallback regression test. **Repository scope added: 0% new
  scope — coherence and remediation only, no new features.**

## 0.1.0 - 2026-04-10

- published the standalone public repo
- added public quick-start, UI value notes, and public boundaries docs
- added public GitHub hardening surfaces:
  - CI
  - secret-scan workflow
  - issue templates
  - PR template
  - contributing/security/support docs
- added the public app screenshot and simple TPK explanation
