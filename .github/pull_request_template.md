## Summary

Describe what changed and why.

## Validation

- [ ] `python tools/check_public_repo_hygiene.py`
- [ ] `pytest -q`
- [ ] `ruff check .`
- [ ] `ruff format --check .`
- [ ] Docs updated if behavior changed
- [ ] `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/HUMAN_QUICKSTART.md`, `docs/AGENT_QUICKSTART.md`, `docs/UI_VALUE_NOTES.md`, and `docs/PUBLIC_BOUNDARIES.md` are aligned
- [ ] Confirmed no private repo names, usernames, absolute private paths, or internal export language entered public files
- [ ] Confirmed LM model loading remains outside this app

## Risk Notes

Call out any behavior changes related to:

- MX3 routing and manager-boundary assumptions
- feeder controls
- telemetry/accounting values
- public privacy or release hygiene
