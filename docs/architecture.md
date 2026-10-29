# Initial Architecture

## First milestone: Incoming Events

Flow:

1. A user submits a sample event through the web UI.
2. The React app sends it to the NestJS API.
3. The API validates the payload and persists the event in PostgreSQL.
4. The UI displays the stored event and its basic status.

## Initial event fields

- id
- tenantId
- source
- eventType
- severity
- title
- message
- assetId (optional)
- occurredAt
- receivedAt
- status

## Planned bounded capabilities

- **Event ingestion:** validate and persist incoming events.
- **Routing policies:** decide recipients and channels based on event properties.
- **Recipient directory:** users, teams, roles, and contact endpoints.
- **Template management:** channel-aware message templates and variables.
- **Delivery orchestration:** queue work, retry failures, and record attempts.
- **Suppression:** mute windows, snooze, deduplication, and rate limits.
- **Audit/history:** preserve configuration changes and delivery outcomes.

Keep these as logical modules first. Split them into separately deployed services only when scaling, ownership, or reliability requirements justify it.

## Important distinctions

- An **event** is an incoming observation or occurrence.
- An **alarm** is a managed condition with a lifecycle, if/when alarm management is added.
- A **notification** is a message attempt to inform a recipient.
- **Delivery status** does not mean that the recipient acknowledged or resolved an alarm.

## Tenant isolation

Every tenant-owned record must be scoped by tenant. The API must derive or validate tenant context from authenticated identity, and database access must not trust a tenant ID supplied by the browser alone.

## Safety

This system communicates information; it must not replace local equipment safety controls or hardwired interlocks.
