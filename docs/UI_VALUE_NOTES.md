# UI value notes

This glossary describes the visible values in the public desktop app.

## Status pills

- `Inference Plane`: the public aggregate inference plane. Expected public value: `127.0.0.1:9000/v1`.
- `MX3 Manager`: the MX3 manager/hardware-management boundary. Expected public value: `127.0.0.1:10000`.
- `MX3 Device`: visible driver and chip detection reported by the runtime.
- `Feeder`: current DFP/feeder state for the MX3 lane.

## Load and Control

- `DFP Runtime`: the currently selected DFP target for the MX3 lane.
- `Apply DFP`: applies the selected DFP target.
- `Import DFP`: imports a DFP artifact into the public control lane.
- `Unlock MX3`: clears the pre-start hardware lock condition before feeder start.
- `Start Feeder`: starts the feeder after DFP selection and unlock.
- `Stop Feeder`: stops the feeder without changing LM model loading.
- `Reset Feeder`: clears the feeder state and prepares for a clean restart.
- `Validate MX3`: runs the public validation check for the MX3 lane.
- `Refresh`: refreshes visible runtime state.

## Live Hardware Telemetry

- `Utilization`: current device-utilization reading when available.
- `Driver`: detected MX3 driver version.
- `Chips`: detected device chip count.
- `Temperature`: latest thermal reading from the runtime.
- `Throughput`: live request-rate or equivalent runtime throughput signal.
- `Requests`: request count seen by the public runtime surface.
- `Rolling average latency`: recent smoothed latency window, not a single raw request.
- `Source probe age`: age of the telemetry sample currently displayed.
- `TPK`: `tokens per kilowatt-hour`. In plain English, how much text the system produced for the electricity it used. Higher is better. It matters because this app is supposed to prove real MX3-backed inference, not just that a response appeared on screen.
- `Estimated savings`: a simple local-versus-cloud comparison derived from current local runtime evidence. Treat it as a directional estimate, not a bill.

## Routing Details

- Displays the current public lane contract, active DFP, feeder state, and temperature-source labels.

## Common placeholder states

- `n/a`: no verified value is available yet.
- `Preview`: display is using a preview surface or placeholder state, not final measured truth.
- `No sample yet`: the runtime has not published a verified sample yet.
- `unknown`: state exists but is not yet verified.
- `standby`: ready but not actively feeding.
- `idle`: present but not actively serving work.
- `live`: actively feeding or serving work.
- `aligned`: feeder/runtime/DFP state agrees.
- `pending` or `path pending`: a selected target exists but has not been fully applied/validated yet.
