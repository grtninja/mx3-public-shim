# MX3 Public Shim

`mx3-public-shim` is the public-safe MemryX MX3 control surface and thin shim candidate.

It is intentionally narrower than the private workstation repo.

## Public dependency contract

The public repo may clone and depend on only one official vendor repository:

- `MemryX_eXamples`
- Upstream: `https://github.com/memryx/MemryX_eXamples`

Public repo rules:

1. The public repo must not depend on the broader private AMD XDNA clone set.
2. The public repo must not depend on private workstation mirrors under `state/` or `external/`.
3. The public repo uses `MemryX_eXamples` as the official vendor-first reference for MX3 lifecycle behavior.

## What the public app is for

1. Validate the MX3 path.
2. Load and switch DFP runtime targets.
3. Control the feeder state.
4. Read real telemetry, latency, TPK, thermals, and cost/savings evidence.

## Runtime contract

- `http://127.0.0.1:9000/v1` is the aggregate inference plane.
- `http://127.0.0.1:10000` is the MX3 manager/device boundary.
- `http://127.0.0.1:2337/v1` is the hosted chat lane.
- `http://127.0.0.1:2236/v1` is the embedding lane.
- `:10000` is the hardware-management boundary; `:9000` consumes MX3 through that boundary and is not the driver itself.
- `:2236` and `:2337` are dedicated side lanes that feed the aggregate plane on
  `:9000`; do not collapse them into LM Studio inventory truth.
- If `:9000` is already healthy, restore missing side lanes without bouncing the
  aggregate plane.

The Electron surface is a DFP + feeder + telemetry control center. LM model loading belongs to LM Studio, not this app.

## For humans

1. Checks green.
2. Load a DFP.
3. Use your AI app on the inference plane.
4. Read telemetry and evidence.

## For AI agents

- Treat `9000` as authoritative model-plane truth.
- Treat `10000` as the MX3 manager/device boundary, not as the public inference plane.
- Keep LM Studio inventory non-authoritative.
- Keep the public repo aligned to `MemryX_eXamples` for vendor-first lifecycle behavior.

## Quick start

```bash
pip install -e ".[dev]"
python -m mx3_public_shim.doctor
python -m mx3_public_shim.server
```

## Desktop shell

```bash
npm install
npm run desktop:start
```

The public Electron shell is frontend-only. It must not auto-start, stop,
restart, or rebind the backend runtime. Use it as an operator surface over an
already-live runtime on `9000` / `2236` / `2337`. If `:9000` is already
healthy, do not bounce it just to restore `:2236` or `:2337`.

## DFP candidates

These are design targets for the public story, not bundled binaries:

- `mx3_llm_generalist_tokenlane_ctx128_v1`
- `mx3_code_expert_tokenlane_ctx256_v1`
- `mx3-memory-embed-dfp`

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

## Current platform posture

- `http://127.0.0.1:9000/v1` is the authoritative public inference plane.
- `127.0.0.1:10000` is the MX3 manager and hardware-management boundary.
- `http://127.0.0.1:2236/v1` is the feeder-independent embedding lane.
- `http://127.0.0.1:2337/v1` is the hosted chat side lane.
- LM model loading belongs to LM Studio or the operator's chosen inference host.
- The public desktop app controls DFP selection, feeder lifecycle, telemetry, and evidence only.

## Quick start

### For humans

1. Checks green.
2. Load a DFP.
3. Use your AI app on the inference plane.
4. Read telemetry and evidence.

See [docs/HUMAN_QUICKSTART.md](./docs/HUMAN_QUICKSTART.md) for the exact first-use path.

### For AI agents

- Probe `GET /healthz` first.
- Treat `9000` as authoritative.
- Treat `10000` as the hardware-management boundary.
- Treat `2236` as feeder-independent.
- Do not treat LM Studio as runtime truth.

See [docs/AGENT_QUICKSTART.md](./docs/AGENT_QUICKSTART.md) for the full contract.

## Desktop shell

```bash
npm install
npm run desktop:start
```

The desktop shell is frontend-only. It must not start, stop, or rebind backend runtime services.

## UI values

The app displays status pills, feeder state, runtime counters, rolling latency, TPK, estimated savings, and routing details.

See [docs/UI_VALUE_NOTES.md](./docs/UI_VALUE_NOTES.md) for direct notes on every visible value.

## Boundaries

See [docs/PUBLIC_BOUNDARIES.md](./docs/PUBLIC_BOUNDARIES.md).

## MemPalace seam

The public repo keeps the MemPalace alignment narrow and examples-first. It demonstrates how MX3-backed local inference and telemetry can support local memory-system acceleration without leaking private maintainer strategy into the product surface.

## Official links

- Public repo: `https://github.com/grtninja/mx3-public-shim`
- MemryX GitHub
- Developer Hub
- Patreon

## Support development

Patreon support helps keep the public desktop shell, feeder controls, telemetry work, and vendor-aligned Windows/Linux docs maintained.
