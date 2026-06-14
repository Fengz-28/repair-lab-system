# Section H - Healthcheck, Logging, and Observability

Status: audited and documented. No runtime logic changed.

## Current healthcheck

Endpoint:

```txt
GET /api/health
```

Current checks:

- database connectivity with `SELECT 1`;
- private storage root read/write availability;
- JSON status response;
- `Cache-Control: no-store`;
- `200` when all components are `ok`;
- `503` when a component is `degraded`.

Current response fields:

- `status`
- `database`
- `storage`
- `timestamp`

The healthcheck does not expose secrets, connection strings, filesystem paths, customer data, ticket data, or stack traces.

## What healthcheck should be used for

Use `/api/health` for:

- uptime monitoring;
- reverse proxy health checks;
- manual smoke checks after deploy;
- confirming DB and private storage availability.

Do not use `/api/health` as:

- a full business workflow test;
- a backup verification;
- a migration status check;
- a worker/outbox health guarantee.

## Current logging coverage

Current logs exist in:

- backup scripts;
- IntegrationEvent worker;
- admin private file download failures;
- login attempt audit records;
- selected service failures returned as user-facing messages.

Important behavior already present:

- database backup errors redact the DB password;
- private file download errors do not expose file paths to the client;
- healthcheck output does not include sensitive diagnostics;
- worker logs summarize processed, failed, and cancelled events.

## Sensitive logging rules

Production logs must not include:

- passwords;
- auth/session cookies;
- `AUTH_SECRET`;
- `DATABASE_URL`;
- public portal tokens;
- private file storage keys unless strictly necessary for internal debugging;
- customer device photos;
- raw private file contents;
- full customer notes or internal notes;
- payment-sensitive details beyond internal IDs and status.

Preferred identifiers:

- `ticketId`
- `ticketNumber`
- `invoiceId`
- `quoteId`
- `fileAssetId`
- `messageLogId`
- `integrationEventId`

## Production-critical failures to log

Priority paths:

- auth/session failures that indicate misconfiguration;
- repeated login rate limit events;
- ticket mutation failures;
- quote/invoice mutation failures;
- PDF generation failures;
- private file upload/download failures;
- payment registration failures;
- IntegrationEvent worker failures;
- backup script failures;
- healthcheck component failures if monitored externally.

## Recommended log shape

When adding logs, prefer structured event-style messages:

```txt
event=<event_name> component=<component> result=<ok|error> id=<safe_id>
```

Examples:

```txt
event=pdf.generate component=invoice result=error invoiceId=<id>
event=file.download component=private-storage result=error fileAssetId=<id>
event=worker.process component=integration-event result=failed integrationEventId=<id>
```

Avoid logging full objects from Prisma, request bodies, `FormData`, headers, cookies, or raw caught errors if they may contain sensitive context.

## Metrics to monitor first

Minimum production metrics:

- `/api/health` uptime and status code;
- app process restarts;
- PostgreSQL availability;
- private storage availability;
- failed login attempts;
- failed private file downloads;
- failed PDF generation;
- failed payment registration;
- IntegrationEvent failed/cancelled count;
- backup success/failure;
- backup age;
- disk usage for DB, private storage, and backups.

## Alerts to add first

Recommended alerts:

- `/api/health` returns non-200 for more than 2 consecutive checks;
- backup has not completed in the expected window;
- storage disk usage exceeds safe threshold;
- PostgreSQL is unreachable;
- IntegrationEvent failures exceed expected baseline;
- app process restarts repeatedly.

Provider choice is deferred. Do not add paid monitoring or external services without explicit approval.

## Deferred risks

- No centralized logging pipeline is configured.
- Logs are not yet JSON structured across the app.
- No external uptime monitor is configured.
- No backup success alert exists.
- No error tracking provider is configured.
- Worker is still `run once`, so worker health depends on the future scheduler/process manager.
- Some domain actions catch errors and return user-facing messages without structured internal logs.

## Section H decision

No runtime changes were made in this section because:

- the healthcheck already covers app, database, and storage basics;
- adding logs across every sensitive action would be a broad refactor;
- monitoring provider and retention decisions belong to deployment/operations planning;
- logs must be introduced carefully to avoid leaking customer or repair data.
