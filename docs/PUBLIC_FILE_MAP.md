# Public file map

This document is the file map for the public MX3 app repository.

## Top-level structure

- `.github/`: CI, issue templates, and PR templates for the public repo.
- `contrib/`: optional upstream contribution material, currently focused on the MemPalace example lane.
- `docs/`: public onboarding, UI notes, boundaries, and screenshots.
- `electron/`: desktop shell launcher for the frontend-only public app.
- `examples/`: runnable examples that prove the public shim surface.
- `src/`: Python package and frontend source.
- `tests/`: public validation coverage.
- `tools/`: small repo-local validation helpers used by CI and local checks.
- `.gitattributes`: Git text/binary normalization.
- `.gitignore`: local artifact exclusions.
- `CONTRIBUTING.md`: contributor workflow for the public repo.
- `CHANGELOG.md`: public release history.
- `LICENSE`: public license.
- `package-lock.json`: pinned desktop-shell JavaScript dependency lock.
- `package.json`: desktop-shell package manifest.
- `pyproject.toml`: Python package manifest.
- `README.md`: public landing doc.
- `SECURITY.md`: security and reporting guidance.
- `SUPPORT.md`: public support and reporting guidance.

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
- `docs/images/nexus-control-center-reference.png`

## Reference docs

- `docs/MEMPALACE_CORRELATION.md`
