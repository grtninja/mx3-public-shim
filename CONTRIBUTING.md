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
- Keep LM model loading outside this app.
- Treat the desktop shell as a control and telemetry surface over an already-running backend.

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
