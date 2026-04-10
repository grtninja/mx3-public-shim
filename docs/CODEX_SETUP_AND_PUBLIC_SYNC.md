# Maintainer sync and validation

This document is maintainer-facing. It is not the product quickstart.

## Product-facing docs

- `docs/HUMAN_QUICKSTART.md`
- `docs/AGENT_QUICKSTART.md`
- `docs/UI_VALUE_NOTES.md`
- `docs/PUBLIC_BOUNDARIES.md`
- `docs/PUBLIC_FILE_MAP.md`

## Maintainer setup

```bash
pip install -e ".[dev]"
python -m mx3_public_shim.doctor
npm install
npm run desktop:start
```

## Validation

```bash
pytest -q
ruff check .
ruff format --check .
```

## Public-agent runtime contract

- Probe `GET /healthz` first.
- Treat `http://127.0.0.1:9000/v1` as the authoritative inference plane.
- Treat `127.0.0.1:10000` as the MX3 manager boundary.
- Treat `http://127.0.0.1:2236/v1` as the feeder-independent embedding lane.
- Treat `http://127.0.0.1:2337/v1` as the hosted chat side lane.
- Do not make LM Studio the source of truth for runtime state.

## Sync rule

- Author in the canonical candidate first.
- Export into the tracked public mirror second.
- Fail closed on privacy, public-shape, and validation gates before any push.
