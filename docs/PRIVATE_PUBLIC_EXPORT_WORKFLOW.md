# Private-to-public export workflow

This public repo is not promoted by ad hoc copying.

It is the tracked public mirror for a vetted private canonical candidate.

## For humans

1. Improve and vet the canonical private candidate first.
2. Re-export into this tracked public mirror.
3. Confirm the public page has a real control surface and simple setup instructions.
4. Treat push readiness as blocked until safety, shape, and validation checks pass.

## For AI agents

- Do not author directly in the public mirror.
- Require simple explicit instructions for humans and for AI before a repo counts as public-shaped.
- Keep the page app-first and avoid debug-only JSON surfaces.
- Re-run export from the private source after every public-shape or docs fix.
- Treat the public Electron shell as frontend-only; it must not start, stop, or
  rebind the backend runtime.
- Keep the runtime lane contract explicit:
  - `9000` = aggregate inference plane
  - `10000` = MX3 manager/device boundary
  - `2236` = embedding lane
  - `2337` = hosted chat lane
- If `9000` is already healthy, do not bounce it just to restore `2236` or
  `2337`.

Expected workflow:

1. improve and vet the canonical candidate
2. export into this tracked mirror
3. pass public safety checks
4. pass tests, lint, and format checks
5. only then consider a public push

## Release doc gate

Before any public push:

- `README.md` must include current platform posture, human quick start, agent quick start, desktop-shell posture, and MemPalace seam notes.
- `docs/HUMAN_QUICKSTART.md` must exist and map directly to the visible UI.
- `docs/AGENT_QUICKSTART.md` must exist and declare the public runtime authority order.
- `docs/UI_VALUE_NOTES.md` must explain visible pills, counters, placeholders, TPK, estimated savings, and routing details.
- `docs/PUBLIC_BOUNDARIES.md` must declare what belongs to LM Studio, the public app, and vendor/runtime ownership.
- `docs/PUBLIC_FILE_MAP.md` must describe the exact top-level structure.
- Release-facing docs must not leak internal maintainer strategy, private-machine framing, approval-only language, or workstation-only guidance.
