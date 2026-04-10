# Agent quickstart

## Authority order

1. `http://127.0.0.1:9000/v1` is the authoritative public inference plane.
2. `http://127.0.0.1:2236/v1` is the embedding side lane and is feeder-independent.
3. `http://127.0.0.1:2337/v1` is the hosted chat side lane.
4. `127.0.0.1:10000` is the MX3 manager/hardware-management boundary.
5. LM Studio UI and `127.0.0.1:1234/v1` are operator surfaces, not source-of-truth runtime authority.

## Public-safe operating rules

- Do not start, stop, or rebind backend runtime services from the public Electron shell.
- Treat the public app as DFP + feeder + telemetry control only.
- Do not infer feeder truth from embedding availability.
- Do not claim MX3 is live unless feeder/runtime alignment and telemetry support it.
- If `9000` is already healthy, do not bounce it just to restore `2236` or `2337`.

## Feeder rule

- Unlock hardware before feeder start or restart.

## Public boundary rule

- Keep internal strategy, private machine details, secrets, approval-only language, and non-public service surfaces out of release-facing docs and UI.
