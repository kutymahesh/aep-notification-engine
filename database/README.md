# Database

PostgreSQL is started through the root `docker-compose.yml`.

The first API checkpoint uses temporary in-memory event storage so the HTTP contract can be tested before introducing persistence. Next, add versioned migrations and a PostgreSQL-backed repository.

Planned first tables:

- `tenants`
- `incoming_events` (tenant-scoped)
- `routing_policies`
- `recipients`
- `notification_templates`
- `delivery_attempts`

Do not store passwords or provider credentials in these tables as plaintext. Use a secrets manager or encrypted provider-specific configuration.
