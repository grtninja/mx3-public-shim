# MemryX eXamples companion docs PR candidate

Status: candidate only, not pushed
Date: 2026-04-10

## Target repo

- `memryx/MemryX_eXamples`
- https://github.com/memryx/MemryX_eXamples

## Why this is companion-only

`MemryX_eXamples` is the operator-facing onboarding surface, but it is not the authoritative runtime/manager repo. The right role here is a small troubleshooting note that points users toward the correct manager-boundary truth instead of duplicating the full runtime contract.

## Contribution protocol confirmed

From `CONTRIBUTING.md`:
- fork the repository
- create a branch
- follow the existing file structure
- write clear README updates
- test before submission
- submit a clear PR description

## Official intake outcome

Official public intake was completed on 2026-04-10 via GitHub Discussions:
- category: `Ideas`
- discussion: `#18`
- title: `Windows docs: verify the MX3 manager boundary before assuming reboot`
- URL: https://github.com/memryx/MemryX_eXamples/discussions/18

This means the docs/troubleshooting request is no longer local-only. The next upstream step for this companion repo is a narrow docs PR against the default branch `release` when we are ready to submit code/docs changes.

## Recommended PR shape

Type:
- docs-only

Recommended title:
- `docs(gui): add Windows MX3 manager-boundary troubleshooting note`

Recommended files:
- `README.md`
- `gui/README.md`

Recommended note shape:
1. If the launcher or example opens but MX3 is not truly live on Windows, verify the MX3 manager/service boundary first.
2. Do not assume the first failure requires a full reboot.
3. Point readers to the authoritative runtime docs / `MxAccl` guidance for shared-mode ownership and recovery.

## Suggested short text

```markdown
### Windows note

If the launcher or an example starts but the MX3 hardware path is not truly live, verify the MX3 manager/service boundary first before assuming a full machine reboot is required. On Windows, the shared manager path is the authoritative hardware-management boundary.
```

## No-push state

This candidate is prepared locally only.
No upstream push or PR creation has been performed from this repo.
