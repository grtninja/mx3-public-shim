# MX3 Public Shim

`NEXUS CONTROL CENTER` is a small app for proving LLM inference on MX3 hardware.

Use it to validate the MX3 path, load DFP runtimes, control feeder state, and read live hardware telemetry.

## What it does

1. Checks the MX3 path and manager boundary.
2. Loads and switches DFP runtime targets.
3. Starts, stops, unlocks, and resets feeder state.
4. Shows live telemetry, latency, TPK, thermals, and savings estimates.
5. Keeps LM model loading in LM Studio or your preferred inference app.

## Quick start

### For humans

1. Checks green.
2. Load a DFP.
3. Use your AI app on the inference plane.
4. Read telemetry and evidence.

More detail:
- `docs/HUMAN_QUICKSTART.md`
- `docs/UI_VALUE_NOTES.md`

### For AI agents

Use the agent contract here:
- `docs/AGENT_QUICKSTART.md`
- `docs/PUBLIC_BOUNDARIES.md`
- `docs/PUBLIC_FILE_MAP.md`

## Runtime

- `http://127.0.0.1:9000/v1` is the aggregate inference plane.
- `http://127.0.0.1:10000` is the MX3 manager and device boundary.
- `http://127.0.0.1:2236/v1` is the embedding lane.
- `http://127.0.0.1:2337/v1` is the hosted chat lane.

LM model loading belongs to LM Studio, not this app.

The desktop app is frontend-only. It should be used as a control and telemetry surface over an already-running backend.

## Python quick start

```bash
pip install -e ".[dev]"
python -m mx3_public_shim.doctor
python -m mx3_public_shim.server
```

## Desktop quick start

```bash
npm install
npm run desktop:start
```

## Official links

- Public repo: `https://github.com/grtninja/mx3-public-shim`
- MemryX GitHub: `https://github.com/memryx`
- MemryX Developer Hub: `https://developer.memryx.com/`
- MemryX site: `https://memryx.com/`

## Support development

- Patreon: `https://www.patreon.com/cw/grtninja`
- Posts: `https://www.patreon.com/grtninja/posts`

## Validation

```bash
pytest -q
ruff check .
ruff format --check .
```
