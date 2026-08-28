# Contributing

## Engineering standard

Apply high effort and thorough reasoning across implementation, tests, package metadata, documentation, public hygiene, hardware truth, process lifecycle, and operator-visible acceptance.

Complete the full affected product surface. Keep the public repository standalone, reproducible, host-agnostic, source-attributable, and ready for maintainers and users.

## Development setup

Requirements:

- Python 3.11+
- Node.js 20+
- Git

Install dependencies:

```bash
pip install -e ".[dev]"
npm install
```

## Complete validation

Run the task-relevant verification set:

```bash
python tools/check_public_repo_hygiene.py
pytest -q
ruff check .
ruff format --check .
npm test --if-present
npm run build --if-present
```

Add package installation, Electron launch, API schema, DFP, feeder, telemetry, embedding, privacy, and real-device validation whenever the changed outcome depends on them.

## Public product contract

Keep public source and documentation in this form:

- repository-relative commands and examples;
- public product, package, endpoint, and schema names;
- official upstream and vendor links;
- complete human and AI-agent quick starts;
- public-safe configuration and fixtures;
- secrets-free documentation and UI text;
- current support, security, contribution, and release guidance;
- source-attributable dependencies and assets.

Private workstation topology, private repository names, credentials, raw private evidence, internal coordination, and private export machinery remain in their owning private source lane.

## Runtime ownership

Keep service roles explicit:

- `http://127.0.0.1:1234/v1` — selected local model host when LM Studio is used;
- `http://127.0.0.1:9000` — MX3 device, DFP, feeder, telemetry, and compatibility services;
- `http://127.0.0.1:2236/v1` — dedicated embedding lane where configured;
- `http://127.0.0.1:2337/v1` — explicitly selected optional hosted chat lane;
- `http://127.0.0.1:10000` — internal MX3 manager and hardware boundary.

The public desktop application owns its Control Center workflow. The selected model host owns language-model loading and residency. The MX3 backend owns device, DFP, feeder, telemetry, and accelerator execution truth.

## Shared release order

For behavior shared with the authoritative runtime provider or published integration plugin:

1. land and validate the authoritative runtime-provider change;
2. synchronize and publish the integration plugin when its contract changes;
3. update this public repository with current compatibility evidence;
4. run target-repository tests, package checks, public hygiene, and visible application acceptance;
5. publish through the approved public pull-request and release workflow.

## Pull-request packet

Before opening or updating a pull request:

1. Identify the root cause and full affected dependency graph.
2. Implement the complete product-level correction.
3. Add regression and integration coverage.
4. Run the full task-relevant validation set.
5. Reconcile `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, public docs, package metadata, and examples.
6. Record exact base and head commits.
7. Describe hardware, process, privacy, package, and compatibility evidence.
8. Include the current visible operator-acceptance state.
9. Record each genuine external dependency with its exact continuation step.

Call out changes involving:

- MX3 manager and device boundaries;
- DFP loading and admission;
- feeder lifecycle;
- telemetry and accounting values;
- embedding and compatibility routes;
- package or installer behavior;
- privacy and public-release hygiene;
- desktop startup and operator workflow.

## Security

Use `SECURITY.md` for security findings and coordinated disclosure. Preserve public safety, user data, service continuity, and exact evidence throughout investigation and remediation.

## Completion

A contribution is complete when the requested public product behavior works, every materially affected surface is synchronized, exact-head validation and public hygiene pass, hardware and process evidence is truthful, the visible workflow succeeds, and each genuine external dependency has a precise continuation path.
