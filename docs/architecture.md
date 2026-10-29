# Notification Engine — Boiler MVP

## User workflow

1. **Create an incoming event:** choose a boiler event type, asset, title, and severity. Sample/manual events are explicitly marked; live telemetry ingestion is not implemented yet.
2. **Manage recipients:** create a person with role, email/phone, available channels, and active state.
3. **Configure routing policies:** prototype policies demonstrate severity-based routing to operator, maintenance, and manager contacts.
4. **Future delivery:** resolve matching enabled policies, intersect policy channels with recipient-enabled channels, create a delivery job per destination, then track provider attempts and outcomes.

## Boiler event catalog (examples only)

| Event type | Example trigger source | Suggested demo severity |
|---|---|---|
| `temperature.high` | Validated temperature reading crosses site-configured threshold | Warning |
| `pressure.high` | Validated pressure reading crosses approved threshold | Critical |
| `water_level.low` | Validated level reading or controller status crosses approved threshold | Critical |
| `burner.ignition_failure` | Burner controller reports ignition failure | Critical |
| `pump.fault` | Pump/controller fault feedback is received | Critical |
| `device.offline` | Expected telemetry/check-in has not arrived within configured timeout | Warning |

These are examples, not safe universal setpoints. Thresholds, debounce/hysteresis, units, sensor quality, and offline timeout must be configured for each installation. Do not infer ignition failure from temperature alone. Cloud notifications must never replace local burner management, low-water cutoffs, pressure relief, or other safety interlocks.

## Starter API

- `GET /api/events` — list sample and created events.
- `POST /api/events` — create a manual test event; requires `title`, `eventType`, and `asset`; optional `severity` and `source`.
- `PATCH /api/events/:id/review` — mark an event reviewed.
- `GET /api/recipients` — list recipient contacts.
- `POST /api/recipients` — create a recipient; requires `name` and at least one email or phone.
- `PATCH /api/recipients/:id/toggle` — toggle active state.

The API currently uses in-memory storage. Data resets when the API restarts. The current UI prototype uses browser state and does not call these endpoints yet. No actual email/SMS/push delivery is performed.

## Recipient and policy design

Recipient fields: id, name, role, email, phone, channels, active, createdAt.

Routing should match event type/severity/asset/tenant and then choose active recipients whose available channels overlap the policy channels. Future delivery jobs should record destination, channel, status, attempt count, provider message ID, error, and timestamps. Delivery status must remain separate from event/alarm acknowledgement.

## Next engineering steps

1. Connect UI to the API and replace browser-only state.
2. Add PostgreSQL schema/migrations and persistence.
3. Add authentication and enforce tenant isolation server-side.
4. Implement policy CRUD and deterministic event-to-recipient matching.
5. Add queue/outbox, provider adapters, retries, idempotency, rate limits, suppression, and audit history.
