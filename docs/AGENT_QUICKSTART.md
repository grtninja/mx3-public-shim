# Agent quick start

## Mission

Apply high effort and thorough reasoning. Complete the requested public MX3 workflow across every task-relevant backend, device, DFP, feeder, telemetry, desktop, test, package, and documentation surface. Preserve public safety, hardware truth, user state, and exact evidence.

## Runtime roles

1. `http://127.0.0.1:1234/v1` is the direct LM Studio model endpoint.
2. `http://127.0.0.1:9000` is the MX3 support-only service for device, DFP, feeder, telemetry, and accelerator state.
3. `http://127.0.0.1:10000` is the MX3 manager and hardware-support boundary.

The selected model host owns language-model loading and residency. The MX3 backend owns device, DFP, feeder, telemetry, and accelerator execution truth. The desktop application owns the visible Control Center workflow.

## Operating rules

- Keep the Electron shell frontend-only; it must not start, stop, rebind, or implicitly bounce backend runtime services.
- Treat this public app as an MX3 DFP, feeder, device, and telemetry control surface over already-running services.
- Keep model loading and residency with direct LM Studio at `http://127.0.0.1:1234/v1`; do not infer model state from MX3 support telemetry.
- Do not infer feeder truth from embedding availability.
- Do not claim that MX3 is live unless feeder/runtime alignment and telemetry support it.
- If the MX3 support service is healthy, do not bounce it merely to restore an optional side lane.

## Feeder rule

Unlock MX3 hardware before feeder start or restart. Keep unlock, DFP selection, and feeder start as explicit operator actions.

## Complete workflow

1. Read `README.md`, `CONTRIBUTING.md`, and `docs/PUBLIC_BOUNDARIES.md`.
2. Bind the exact request, repository head, runtime route, physical or fixture device class, DFP target, output, and acceptance criteria.
3. Verify backend, manager, device, DFP, feeder, embedding, and desktop state from their owning surfaces.
4. Implement the complete correction across source, tests, package metadata, and public documentation.
5. Keep model-host operations within the selected model runtime and MX3 operations within the MX3 backend.
6. Preserve feeder truth independently from embedding availability.
7. Use the official lifecycle order required by the active MemryX runtime and capture current evidence.
8. Pair backend readiness with the visible Control Center workflow.
9. Run the complete validation matrix and public hygiene checks.
10. Record current exact-head evidence and the exact continuation step for each genuine external dependency.

## Hardware and telemetry evidence

A physical-hardware acceptance packet includes:

- current device identity and count;
- manager state;
- selected device;
- DFP identity and hash;
- feeder state;
- execution output;
- telemetry source and timestamp;
- latency and throughput;
- temperature and energy evidence when supported;
- process and listener ownership;
- visible desktop result.

Development fixtures remain explicitly labeled as fixtures and carry synthetic provenance.

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
