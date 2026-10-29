# Boiler Notification Engine MVP

Event creation modes: manual test events; telemetry threshold events; controller-originated fault/status events; scheduled maintenance events.

## Default event catalog
The API exposes GET /api/boiler/event-catalog. Defaults are examples, not universal safe settings.
- steam_pressure.high — Critical; configured pressure limit exceeded.
- steam_pressure.low — Warning; configured operating range under-run.
- boiler_temperature.high — Warning; configured temperature limit exceeded.
- water_level.low — Critical; verified level below approved threshold.
- water_level.high — Warning; verified level above configured range.
- burner.flame_failure — Critical; burner management controller signal.
- burner.lockout — Critical; controller lockout state.
- feedwater_pump.fault — Critical; validated pump/controller fault.
- flue_gas_temperature.high — Warning; configured flue-gas limit exceeded.
- sensor.fault — Warning; diagnostics/data quality identify invalid or stale readings.
- gateway.offline — Warning; heartbeat timeout.
- maintenance.due — Info; configured calendar/runtime interval reached.

POST /api/events/from-telemetry accepts eventType, asset, numeric value, numeric threshold, optional unit and source. It creates an event only when a supported high/low condition crosses the supplied threshold. This first pass has no hysteresis, debounce, units conversion or stale-reading validation.

## API
- GET /api/events
- POST /api/events
- POST /api/events/from-telemetry
- PATCH /api/events/:id/review
- GET /api/boiler/event-catalog
- GET /api/recipients
- POST /api/recipients
- PATCH /api/recipients/:id/toggle

database/schema.sql defines starter tables for tenants, assets, events, recipients, routing policies, delivery records and audit logs. The API still uses in-memory stores; PostgreSQL is not wired to the API yet. Authentication and server-side tenant scoping are required before multi-tenant use.

Safety: This app is for monitoring/notifications, not boiler control. Burner management, low-water cutoff, pressure relief and other protective functions must remain in appropriate local safety controls. Only use OEM/site-approved limits.
