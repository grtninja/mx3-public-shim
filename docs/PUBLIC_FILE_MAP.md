# Public file map

This document is the file map for the public MX3 app repository.

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

## Reference docs

- `docs/MEMPALACE_CORRELATION.md`
- `contrib/mempalace/PR_CANDIDATE.md`
