# Tracked public repo

This document explains what the tracked public repo contains and how it must stay aligned.

## Role

- The canonical authoring surface lives in the private shim repo under `public/mx3-public-shim/`.
- The standalone `mx3-public-shim` repo is the tracked public mirror.
- Durable changes should be authored and vetted in the canonical candidate first, then exported into the tracked mirror.

## Exact top-level map

- `.github/`: public CI.
- `contrib/`: public upstream contribution material.
- `docs/`: product-facing and maintainer-facing docs.
- `electron/`: desktop shell launcher.
- `examples/`: public usage examples.
- `src/`: package and frontend code.
- `tests/`: public validation coverage.
- Root manifests: `package.json`, `package-lock.json`, `pyproject.toml`, `LICENSE`, `README.md`.

## Public-shape doc inventory

### Product-facing docs
- `README.md`
- `docs/HUMAN_QUICKSTART.md`
- `docs/AGENT_QUICKSTART.md`
- `docs/UI_VALUE_NOTES.md`
- `docs/PUBLIC_BOUNDARIES.md`
- `docs/PUBLIC_FILE_MAP.md`

### Maintainer/reference docs
- `docs/CODEX_SETUP_AND_PUBLIC_SYNC.md`
- `docs/PRIVATE_PUBLIC_EXPORT_WORKFLOW.md`
- `docs/TRACKED_PUBLIC_REPO.md`
- `docs/MEMPALACE_CORRELATION.md`
- `docs/MEMPALACE_PR_CANDIDATE.md`
- `contrib/mempalace/PR_CANDIDATE.md`

## Mirror discipline

- Keep public-facing docs mirrored between the canonical candidate and the tracked public repo.
- If an overlay intentionally changes a doc for the standalone public repo, record that explicitly in the export workflow.
- Do not let the public mirror drift by hand-editing release-critical docs outside the export workflow.
