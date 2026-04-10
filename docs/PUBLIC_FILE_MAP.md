# Public file map

This document is the exact public-shape map for the MX3 public shim repository.

## Top-level structure

- `.github/`: CI for the public repo.
- `contrib/`: optional upstream contribution material, currently focused on the MemPalace example lane.
- `docs/`: public onboarding, boundaries, export, and maintainer-reference docs.
- `electron/`: desktop shell launcher for the frontend-only public app.
- `examples/`: runnable examples that prove the public shim surface.
- `src/`: Python package and frontend source.
- `tests/`: public validation coverage.
- `.gitattributes`: Git text/binary normalization.
- `.gitignore`: local artifact exclusions.
- `.mx3-public-sync.json`: public sync metadata.
- `LICENSE`: public license.
- `package-lock.json`: pinned desktop-shell JavaScript dependency lock.
- `package.json`: desktop-shell package manifest.
- `pyproject.toml`: Python package manifest.
- `README.md`: public landing doc.
- `SYNC_FROM_MAIN_REPO.md`: maintainer-only sync redirect.

## Source package map

- `src/mx3_public_shim/config.py`: runtime configuration helpers.
- `src/mx3_public_shim/doctor.py`: environment and runtime doctor entrypoint.
- `src/mx3_public_shim/mempalace.py`: MemPalace-facing example helpers and seams.
- `src/mx3_public_shim/runtime.py`: public runtime contract and telemetry shaping.
- `src/mx3_public_shim/server.py`: public HTTP surface.
- `src/mx3_public_shim/providers/`: public provider adapters.
- `src/mx3_public_shim/frontend/index.html`: desktop app shell markup.
- `src/mx3_public_shim/frontend/styles.css`: public desktop styling.
- `src/mx3_public_shim/frontend/app.js`: public control-center logic.

## Product-facing docs

- `README.md`
- `docs/HUMAN_QUICKSTART.md`
- `docs/AGENT_QUICKSTART.md`
- `docs/UI_VALUE_NOTES.md`
- `docs/PUBLIC_BOUNDARIES.md`

## Maintainer/reference docs

- `docs/CODEX_SETUP_AND_PUBLIC_SYNC.md`
- `docs/PRIVATE_PUBLIC_EXPORT_WORKFLOW.md`
- `docs/TRACKED_PUBLIC_REPO.md`
- `docs/MEMPALACE_CORRELATION.md`
- `docs/MEMPALACE_PR_CANDIDATE.md`
- `contrib/mempalace/PR_CANDIDATE.md`

## Mirror rule

- The canonical authoring surface lives in the private shim repo under `public/mx3-public-shim/`.
- The standalone public repo is the tracked mirror.
- Public-facing docs must stay mirrored unless a public-safe overlay explicitly replaces them.
