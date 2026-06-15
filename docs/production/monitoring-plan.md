# Production Monitoring Plan

Status: planning document only. No runtime logging code or external monitoring provider has been configured.

## Purpose

This plan defines the first practical monitoring layer for a single-VPS FengzLab / RepairLab deployment.

The goal is to notice operational failures early without refactoring runtime logging prematurely and without exposing customer data, tokens, secrets, or private files.

## What is already available

The app already exposes:

```txt
GET /api/health
```

Current healthcheck behavior:

- checks database connectivity;
- checks private storage root read/write availability;
- returns `200` when all checked components are healthy;
- returns `503` when a checked component is degraded;
- returns only component status and timestamp;
- does not expose secrets, connection strings, filesystem paths, customer data, ticket data, or stack traces.

Reference: `docs/production/observability.md`.

## External uptime monitoring plan

First-stage monitoring can be provider-agnostic.

Monitor:

```txt
https://<staging-or-production-domain>/api/health
```

Initial check frequency:

- staging: every 5 minutes;
- production: every 1 to 5 minutes, depending on provider limits and cost.

Expected healthy response:

```txt
HTTP 200
status=ok
database=ok
storage=ok
```

Expected unhealthy behavior:

```txt
HTTP 503
status=degraded
```

The monitor should alert after repeated failures, not a single transient miss. Suggested first threshold:

```txt
3 consecutive failed checks
```

Do not include auth cookies, portal tokens, or admin URLs in uptime monitor configuration.

## Basic alert targets

Configure alerts for:

- app unavailable;
- `/api/health` returns non-200;
- database check degraded;
- storage check degraded;
- disk usage high;
- backup missing or stale;
- SSL certificate issue;
- reverse proxy failure;
- container restart loop;
- high 5xx rate if proxy logs are available.

Alert destinations can start simple:

- email;
- provider dashboard;
- private chat notification if configured safely later.

Do not send customer data or private file paths in alerts.

## First-stage VPS monitoring

For the first single-VPS staging deployment, monitor these manually or with lightweight provider tooling:

### Docker containers

Check:

```txt
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

Watch for:

- app container not running;
- PostgreSQL container unhealthy;
- repeated restart count;
- migrate service failures;
- app healthcheck failures.

### Logs

Check:

```txt
docker compose --env-file .env.production -f docker-compose.production.yml logs app
docker compose --env-file .env.production -f docker-compose.production.yml logs postgres
```

Use logs for operations only. Do not paste full logs into public tickets, prompts, or screenshots if they might contain tokens, cookies, customer notes, or file metadata.

### Disk usage

Check:

```txt
df -h
docker system df
```

Alert when disk usage is high:

```txt
warning: 75%
critical: 85%
```

High disk usage threatens:

- PostgreSQL writes;
- private uploads;
- backup creation;
- Docker image pulls/builds.

### Memory

Check:

```txt
free -h
docker stats
```

Watch for:

- app memory steadily increasing;
- PostgreSQL memory pressure;
- OOM restarts;
- swap exhaustion if enabled.

### Backups

Check that recent backups exist:

```txt
backups/postgres/
backups/storage/
```

Alert if:

- no DB backup exists after real data is entered;
- no storage backup exists after private files are uploaded;
- latest backup is older than the accepted retention window;
- backup command fails.

Reference: `docs/production/backups-restore.md`.

## Sensitive logging rules

Logs and alerts must not include:

- passwords;
- auth/session cookies;
- `AUTH_SECRET`;
- `DATABASE_URL`;
- full public portal tokens;
- full quote/invoice approval tokens;
- private file contents;
- customer device photos;
- full customer notes;
- internal repair notes;
- payment-sensitive details;
- raw request bodies;
- raw headers;
- full stack traces in public responses.

Safe identifiers for internal logs:

- `ticketId`;
- `ticketNumber`;
- `quoteId`;
- `invoiceId`;
- `fileAssetId`;
- `integrationEventId`;
- coarse event names.

If a token must be referenced internally, log only a short redacted form:

```txt
tokenPrefix=<first-6-chars> tokenRedacted=true
```

Do not log enough token material to access the portal.

## Future structured logging plan

Do not refactor all logging at once.

Recommended staged approach:

1. Define a small internal logging helper for server-only code.
2. Standardize event names for auth, tickets, files, PDFs, payments, backups, and worker events.
3. Add safe IDs and result fields.
4. Redact tokens, secrets, cookies, headers, and raw request bodies by default.
5. Add logs only around production-critical failure paths first.
6. Review each log call for customer privacy before commit.

Suggested log shape:

```txt
event=<event_name> component=<component> result=<ok|error> id=<safe_id>
```

Initial event names:

```txt
auth.login.failed
auth.session.invalid
ticket.mutation.failed
quote.pdf.failed
invoice.pdf.failed
file.upload.failed
file.download.failed
payment.register.failed
backup.db.failed
backup.storage.failed
worker.integration.failed
healthcheck.degraded
```

## Minimum manual monitoring cadence

During staging:

- check `/api/health` after every deploy;
- check Docker container status after every deploy;
- check app logs after smoke QA;
- check disk usage before and after backup tests;
- check backup folders after running backup commands.

During first production week:

- check `/api/health` daily;
- check disk usage daily;
- check backup freshness daily;
- review app logs after any customer-reported issue;
- review container restart count after deploys.

## Deferred implementation risks

Deferred intentionally:

- external monitoring provider selection;
- structured logging implementation;
- log aggregation;
- metrics dashboard;
- uptime alert routing;
- automated backup freshness alerts;
- disk alert automation;
- 5xx rate alerting from reverse proxy logs;
- security event alerting;
- customer-facing status page.

These should be added after staging proves the basic deploy path and before relying on the system for real workshop operations at higher volume.

## Current readiness interpretation

Monitoring is sufficient for staging only if:

- `/api/health` is reachable over HTTPS;
- at least one external uptime check is configured;
- operator knows how to inspect Docker logs, disk, memory, and backup freshness;
- logs and alerts do not leak sensitive data.

Final production remains conditional until monitoring and backup/restore procedures are tested in the real deployment environment.
