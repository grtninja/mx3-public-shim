# MemryX upstream PR candidate: Windows MX3 manager-boundary recovery

Status: candidate only, not pushed
Date: 2026-04-10
Prepared from: canonical private MX3 shim authoring surface

## Target upstream repo

Primary target:
- `memryx/MxAccl`
- https://github.com/memryx/MxAccl

Companion target:
- `memryx/MemryX_eXamples`
- https://github.com/memryx/MemryX_eXamples

## Why `MxAccl` is the primary target

`MxAccl` is the official repo that owns the Windows manager/runtime boundary:
- `mxa_manager`
- Windows service registration as `MxaManagerSvc`
- manager TCP base port `10000`
- shared/local runtime behavior
- `acclBench` shared-mode behavior
- Python binding connection docs

This makes `MxAccl` the right authoritative place for a Windows non-reboot recovery note and clearer manager-boundary diagnostics.

## Current upstream check

Current check on 2026-04-10 via GitHub CLI search:
- no matching open PR found in official MemryX repos for this Windows MX3 recovery / stale `udriver.dll` / manager-boundary lane
- no matching open issue found in official MemryX repos for this same lane from the search terms used

Search terms used:
- `udriver dll`
- `windows installer`
- `mx3 windows`

## Official intake outcome

Official GitHub intake on 2026-04-10:
- `memryx/MxAccl` has issues disabled
- `memryx/MxAccl` has discussions disabled
- direct GitHub-native issue/discussion intake is therefore unavailable on the primary authoritative repo

Fallback official intake used:
- `memryx/MemryX_eXamples` discussion `#18`
- title: `Windows docs: verify the MX3 manager boundary before assuming reboot`
- URL: https://github.com/memryx/MemryX_eXamples/discussions/18

Implication:
- the authoritative `MxAccl` lane still needs a future narrow PR against its default branch `release`
- the companion examples discussion is now the live official public breadcrumb for the Windows docs/troubleshooting request

## Third-party submission protocol followed

1. Conflict scan first: done
2. Narrow repo target: done
3. Keep scope independently useful: done
4. Prefer vendor-first boundary truth: done
5. Avoid broad rewrite when docs + diagnostics can solve the operator problem: done
6. Do not push from this repo until local review is complete: still enforced

## MemryX repo protocol notes

### `memryx/MxAccl`
- No repo-local `CONTRIBUTING.md` was found in the current clone.
- Use the repo README, narrow-scope PR discipline, and standard fork/branch/PR flow.
- Keep the PR small, concrete, and grounded in official runtime ownership.

### `memryx/MemryX_eXamples`
Contribution rules are explicit:
- fork the repo
- create a branch
- follow the existing file structure
- write/update README content clearly
- test before submission
- submit a clear PR description

Source:
- official `memryx/MemryX_eXamples` `CONTRIBUTING.md`

## Recommended upstream PR shape

### Primary PR: `memryx/MxAccl`
Type:
- code-plus-docs

Why:
- docs need the Windows manager-boundary and non-reboot recovery note
- code should ideally emit clearer Windows-specific diagnostics instead of leaving recovery implicit

Recommended title:
- `docs(windows): clarify MX3 manager-boundary recovery and shared-mode diagnostics`

Recommended touched upstream files:
- `README.md`
- `mx_accl/include/memx/accl/MxAccl.h`
- `mx_accl/pymodule/bindings.cpp`
- `tools/acclBench/acclBench.cpp`
- optional diagnostic follow-up in `mxa_manager/main_win.cpp`

Recommended changes:
1. Explicitly document that Windows shared-mode ownership flows through `mxa_manager` on `127.0.0.1:10000`.
2. Clarify that device recovery can succeed without a full machine reboot if the manager/service boundary is restored correctly.
3. Add a short Windows recovery note describing the known-good operator sequence:
   - verify `MxaManagerSvc`
   - verify manager boundary on `10000`
   - restore the client/runtime lane against the manager instead of assuming direct device ownership
4. Tighten CLI/API docs so Windows users understand shared manager mode versus direct runtime expectations.
5. Improve Windows-facing diagnostics where possible so stale-driver or manager-boundary issues do not look like a generic hardware failure.

### Companion PR: `memryx/MemryX_eXamples`
Type:
- docs-only

Recommended title:
- `docs(gui): add Windows MX3 manager-boundary troubleshooting note`

Recommended touched upstream files:
- `README.md`
- `gui/README.md`

Recommended changes:
1. Add a short Windows troubleshooting note near launcher setup / troubleshooting.
2. Tell operators that if examples launch but MX3 hardware is not truly live, they should verify the MX3 manager boundary first.
3. Link back to authoritative runtime docs rather than duplicating the full recovery contract in the examples repo.

## Evidence from the local successful recovery lane

Observed locally on the working non-reboot recovery state:
- `127.0.0.1:10000` owned by `mxa_manager.exe`
- `127.0.0.1:9000` healthy on the known-good MX3 runtime boundary
- feeder restored and stayed aligned
- side lanes restored without disturbing the healthy `9000` owner
- recovery succeeded without a machine reboot

Key local conclusion:
- the user-facing/public inference plane is not the driver
- launcher drift and manager-boundary confusion can masquerade as hardware failure on Windows
- the Windows-facing fix needs to describe `10000 -> manager -> runtime/client -> 9000 aggregate plane` clearly

## Suggested PR body draft

```markdown
## Summary

This PR clarifies the Windows MX3 shared-manager boundary and improves the operator path for recovering a live device/runtime state without over-rotating toward full reboot guidance.

## Why

In practice, Windows MX3 failures can present as generic hardware/device-open problems when the real break is in the manager/service boundary or the runtime client?s relationship to it. The manager boundary already exists and already owns the shared-mode path; this PR makes that clearer in the docs and diagnostics.

## Changes

- documents `mxa_manager` as the Windows shared-mode boundary on the local manager port
- clarifies Windows shared-mode behavior in the API/CLI docs
- adds a short recovery note for restoring manager-boundary ownership before escalating to reboot assumptions
- improves Windows-facing diagnostics where applicable

## Scope

- narrow Windows shared-mode clarification
- no broad runtime redesign
- no change to Linux-first ownership claims

## Validation

- grounded in a successful non-reboot recovery pass on a live MX3 Windows workstation
- aligned to the existing manager/shared-mode architecture already present in this repo
```

## No-push state

This candidate is prepared locally only.
No upstream push or PR creation has been performed from this repo.
