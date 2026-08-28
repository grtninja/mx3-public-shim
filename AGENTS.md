# MX3 Public Shim — Affirmative Agent Contract

## Mission

Apply high effort and thorough reasoning. Complete the authorized objective across every task-relevant source, runtime contract, device service, desktop surface, test, package, document, example, and release artifact. Preserve public safety, hardware truth, user state, source provenance, and operator-visible acceptance throughout the work.

## Product scope

This repository is the public Windows-first Nexus Control Center and MX3 integration surface. It provides:

- MemryX device discovery and current device state;
- DFP inventory, selection, loading, and execution controls;
- feeder lifecycle and recovery controls;
- hardware telemetry, latency, throughput, thermals, and evidence;
- a public OpenAI-compatible compatibility interface for admitted MX3-backed capabilities;
- an Electron operator surface over the repository-owned backend;
- public examples for local embeddings, reranking, and memory-pipeline acceleration;
- installer, package, documentation, support, and release surfaces.

## Runtime roles

Keep service identity explicit:

- `http://127.0.0.1:1234/v1` — local model host when LM Studio is the selected model runtime;
- `http://127.0.0.1:9000` — MX3 device, DFP, feeder, telemetry, and compatibility service plane;
- `http://127.0.0.1:2236/v1` — dedicated embedding lane where configured;
- `http://127.0.0.1:2337/v1` — explicitly selected optional hosted chat lane;
- `http://127.0.0.1:10000` — internal MX3 manager and hardware boundary.

The public desktop application owns its Control Center workflow. The selected model host owns language-model loading and residency. The MX3 backend owns device, DFP, feeder, telemetry, and accelerator execution truth.

## Complete engineering workflow

1. Read `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/AGENT_QUICKSTART.md`, and `docs/PUBLIC_BOUNDARIES.md`.
2. Bind the exact request, public repository head, affected product surfaces, and acceptance criteria.
3. Inspect current source, tests, packages, public documentation, runtime schemas, and rendered operator workflow.
4. Identify the full affected dependency graph.
5. Implement the durable correction across every materially affected surface.
6. Add regression, integration, package, lifecycle, privacy, and user-visible acceptance coverage.
7. Run the complete verification matrix.
8. Synchronize README, public boundaries, quick starts, package metadata, examples, screenshots, support guidance, and release notes.
9. Prove the requested Control Center, API, DFP, feeder, telemetry, embedding, or packaging workflow.
10. Record current exact-head evidence and a precise continuation path for each genuine external dependency.

## Hardware truth

- Report physical MX3 identity, device count, selected device, manager state, DFP identity, feeder state, temperature, timing, throughput, and evidence source accurately.
- Keep requested, configured, discovered, selected, loaded, executing, and useful-work states distinct.
- Use explicit development fixtures for non-hardware tests and preserve their synthetic provenance.
- Pair hardware-dependent release claims with current real-device evidence.
- Keep unsupported metrics visibly unavailable until a measured or documented source supports them.

## Desktop and process lifecycle

- Treat the Electron shell, backend, workers, feeders, listeners, and manager interaction as one owned lifecycle graph.
- Bind process generations to exact identity, start state, endpoint, owner, and terminal receipt.
- Keep startup and recovery intentional, observable, reversible, and documented.
- Reconcile the prior owned generation before admitting a replacement.
- Pair backend readiness with the visible Control Center window and the requested operator action.

## Public repository boundary

Keep all public content standalone and useful:

- repository-relative paths and commands;
- public product and package names;
- public-safe examples and configuration;
- official MemryX and upstream references;
- complete quick-start, validation, troubleshooting, contribution, security, support, and release guidance;
- secrets-free, host-agnostic documentation and UI copy;
- source-attributable dependencies and assets.

Private workstation topology, private repository names, credentials, raw private evidence, internal coordination, and private export machinery remain in their owning private source lane.

## Verification

Run the complete task-relevant set:

```bash
python tools/check_public_repo_hygiene.py
pytest -q
ruff check .
ruff format --check .
npm test --if-present
npm run build --if-present
```

Also run package installation, Electron launch, API schema, DFP and feeder, telemetry, embedding, privacy, and real-device checks whenever the changed outcome depends on them.

## Documentation and release synchronization

Keep these surfaces aligned with implementation:

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `SUPPORT.md`
- `CHANGELOG.md`
- `docs/AGENT_QUICKSTART.md`
- `docs/HUMAN_QUICKSTART.md`
- `docs/PUBLIC_BOUNDARIES.md`
- `docs/PUBLIC_FILE_MAP.md`
- package metadata and public examples.

Shared behavior lands in the authoritative private runtime provider first, then the published integration plugin where applicable, then this public product surface with current compatibility evidence.

## Definition of done

Work is complete when the requested public product outcome works, every materially affected source and documentation surface is synchronized, exact-head validation passes, hardware and process provenance are truthful, public hygiene passes, the real operator workflow succeeds, and each genuine external dependency has an exact continuation path.
