# Public boundaries

## Public product identity

This repository is:

- a public MemryX MX3 desktop control surface;
- a public DFP, feeder, telemetry, and accelerator-evidence lane;
- a public OpenAI-compatible compatibility surface for admitted local integration;
- a public example seam for embeddings, reranking, and memory-pipeline acceleration;
- a standalone package, documentation, support, security, and release surface.

## Ownership boundaries

- The selected local model host at `http://127.0.0.1:1234/v1` owns language-model loading and residency.
- This repository's backend at `http://127.0.0.1:9015` owns the embeddings route, chat forwarding, provider-chain order, and the bundled status UI.
- The private-workstation MX3 support-only service (`:9000`) and manager boundary (`:10000`) are not part of this repository. This app does not call them; do not add calls to them. (Muse)

## Hardware and update boundary

The repository controls its public application and admitted runtime interfaces. Vendor firmware, driver, and manager updates remain within official vendor workflows and explicit operator selection. Language-model loading remains within the selected model host.

## Public information boundary

Release-facing content contains:

- public product and repository names;
- repository-relative commands and paths;
- configuration and examples safe for public release;
- official upstream and vendor links;
- source-attributable packages and assets;
- current quick-start, validation, support, security, and release guidance;
- truthful hardware and compatibility claims backed by current evidence.

Private credentials, private repository names, workstation topology, raw private evidence, internal coordination, and private export machinery remain in their owning private source lane.

## Completion boundary

A public change is complete when the product behavior works, source and docs are synchronized, public hygiene and package validation pass, hardware and process claims are truthful, the visible workflow succeeds, and each genuine external dependency has an exact continuation path.
