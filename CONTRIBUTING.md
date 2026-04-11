# Contributing

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

Quick validation:

```bash
python tools/check_public_repo_hygiene.py
pytest -q
ruff check .
ruff format --check .
```

## Public repo rules

Keep this repo product-facing.

- Do not add private repo names, private workstation paths, usernames, or secrets.
- Do not add internal export-pipeline language to public docs.
- Do not add internal stack lore, internal codenames, or private workflow phrasing to public docs, UI copy, or examples.
- Keep LM model loading outside this app.
- Treat the desktop shell as a control and telemetry surface over an already-running backend.

## Shared release order

If a change affects behavior shared with the LM Studio plugin or the source shim:

1. land and validate the authoritative shim change first
2. sync or publish the published plugin `memryx-shim-provider`
3. update this public shim repo last

Public repo PRs should reflect already-validated plugin and shim behavior, not
invent a future shared state that has not been shipped yet.

## Pull requests

Before opening a PR:

1. Run the validation block above.
2. Update docs if behavior changed.
3. Keep `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, and the public docs under `docs/` aligned.
4. Call out any behavior changes around:
   - MX3 manager boundary
   - DFP loading
   - feeder controls
   - telemetry/accounting values
   - privacy or public-release hygiene

## Security

If you identify a security issue, follow `SECURITY.md`.
