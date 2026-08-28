# Human quickstart

## Hardware requirement

This app requires a MemryX AI Accelerator.

If the hardware is not present, the MX3 path will not validate and the DFP, feeder, and telemetry surfaces will stay unavailable.

## First-use path

1. Open the desktop app.
2. Checks green.
3. Load a DFP.
4. If the feeder is not already live, unlock MX3 and start the feeder.
5. Use LM Studio directly at `http://127.0.0.1:1234/v1` for model loading and inference.
6. Use the MX3 support-only service at `http://127.0.0.1:9000` for device, DFP, feeder, and telemetry state.
7. Read telemetry and evidence in the app.

## What to confirm in the UI

- `LM Studio`: should show the direct model endpoint on `127.0.0.1:1234/v1`.
- `MX3 Support`: should show the support-only service on `127.0.0.1:9000`.
- `MX3 Manager`: should show the MX3 manager on `127.0.0.1:10000`.
- `MX3 Device`: should show driver/chip detection when the device is visible.
- `Feeder`: should move from `Disabled` or `standby` to a real active state after DFP + unlock/start.

## What this app controls

- DFP selection/import.
- Feeder lifecycle.
- MX3 telemetry and evidence.

## What this app does not control

- LM model loading. That belongs to LM Studio or the operator's chosen inference host.
- Vendor firmware updates.
- Private workstation-only services.
