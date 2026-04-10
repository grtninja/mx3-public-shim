# Public boundaries

## What this repo is

- A public MemryX MX3 desktop control surface.
- A public DFP + feeder + telemetry control lane.
- A public OpenAI-compatible shim surface for local inference integration.
- A public demonstration seam for MemPalace-style local memory acceleration examples.

## What this repo is not

- It is not the vendor firmware updater.
- It is not the place to load or unload LM models from LM Studio.

## Ownership boundaries

- LM Studio owns LM model loading.
- The public app owns DFP selection, feeder control, and telemetry display.
- `9000` is the public authoritative inference plane.
- `10000` is the MX3 manager/hardware-management boundary.
- `2236` remains feeder-independent for embeddings.
- `2337` is the hosted chat side lane.

## Release rule

- Do not ship secrets, tokens, private paths, or machine-specific internal guidance.
