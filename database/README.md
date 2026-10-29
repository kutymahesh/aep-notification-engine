# Database

PostgreSQL 16 is available through the root `docker-compose.yml`.

The current API starter uses in-memory data. The UI currently uses browser-only state. The next persistence milestone should add migrations for:

- `tenants`
- `incoming_events` (tenant-scoped, event type, severity, asset, occurred/received timestamps, status)
- `recipients` (tenant-scoped role, contact endpoints, active state)
- `recipient_channels` (or validated channel array)
- `routing_policies` and policy recipient/channel assignments
- `delivery_attempts` (status, attempt number, provider ID, error, timestamps)
- `audit_log`

Do not store provider credentials as plaintext. Enforce tenant isolation in the API and database access layer. Avoid treating delivery as acknowledgement or allowing cloud notifications to replace local boiler safety controls.
