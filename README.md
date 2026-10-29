# AEP Notification Engine

A reusable, tenant-aware notification and routing engine for IoT applications.

## Initial stack

- **Web:** React, TypeScript, Vite, Tailwind CSS
- **API:** NestJS, TypeScript
- **Database:** PostgreSQL
- **Local infrastructure:** Docker Compose

## Planned capabilities

- Ingest sample/manual events first
- Configure routing policies by event type and severity
- Select recipients and delivery channels
- Manage message templates
- Add mute, snooze, suppression, retry, and escalation policies
- Track delivery attempts and outcomes
- Keep tenant boundaries explicit in data and API design

## Repository layout

```text
apps/
  web/       React + Vite + Tailwind UI
  api/       NestJS REST API
database/    SQL schema and migrations
docs/        Requirements and architecture notes
docker-compose.yml
.env.example
```

## Quick start

Requirements: Node.js 20+, pnpm 9+, and Docker with Compose.

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start PostgreSQL: `docker compose up -d postgres`
3. Install dependencies in each app directory and follow its README/package scripts.

The first milestone is the **Incoming Events** page with sample/manual events. Real provider delivery (email/SMS/push) is not enabled in this starter.

## Safety and security notes

- Never commit real credentials, API keys, or production connection strings.
- Do not treat notification delivery as alarm acknowledgement.
- IoT safety interlocks and critical local control must remain independent of cloud notification workflows.
- Enforce tenant isolation on the server; do not rely on frontend filtering alone.
