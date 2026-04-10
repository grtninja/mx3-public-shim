# Security Policy

## Supported Versions

This repository is maintained on `main`.

| Version | Supported |
| --- | --- |
| `main` | Yes |

## Security scope

Security-sensitive areas include:

- public privacy and release hygiene
- local telemetry/accounting values shown in the UI
- feeder and DFP control surfaces
- startup/launcher behavior
- copy-only public support links and non-browser-launch behavior

## Default posture

- local-first
- loopback-local
- fail-closed on privacy uncertainty
- no public commit of private paths, usernames, or secrets

## Reporting a vulnerability

Do not post exploit details in a public issue.

Instead:

1. Open a private GitHub security advisory, or
2. Contact the maintainer directly with:
   - reproduction steps
   - affected commit or version
   - impact summary
   - proposed mitigation if available
