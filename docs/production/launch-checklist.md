# Section K - Production Launch Checklist

Status: final launch checklist consolidated from Sections A-J. No runtime logic changed.

## Goal

Use this checklist before exposing FengzLab / RepairLab beyond local development or a controlled private test.

This is not a feature roadmap. It is a release gate for a small workshop-first production deployment.

## Launch decision

Do not launch publicly until all critical gates below are complete:

- real production secrets are configured outside Git;
- database migrations are reviewed and executable;
- private storage is persistent and outside `public/`;
- backups exist and a restore drill has been tested against a temporary target;
- admin routes and sensitive mutations require server-side staff authorization;
- customer portal token routes expose only customer-safe data;
- `/api/health` returns healthy status without leaking sensitive diagnostics;
- lint, typecheck, Prisma validation, and tests pass;
- reverse proxy and TLS are configured on the VPS.

## Preflight checklist

### Environment and secrets

- [ ] `.env.production` exists on the server and is not committed.
- [ ] `DATABASE_URL` points to the production PostgreSQL database.
- [ ] `AUTH_SECRET` is strong, unique, and not the local placeholder.
- [ ] `APP_URL`, `PUBLIC_SITE_URL`, `ADMIN_ALLOWED_ORIGINS`, and `CORS_ALLOWED_ORIGINS` use the production HTTPS origin.
- [ ] `NEXT_PUBLIC_ENABLE_CSS_STUDIO=false`.
- [ ] Optional integrations remain disabled unless contracts, logging, rollback, and env values are ready.
- [ ] No real secrets were added to docs, source code, logs, or Git history.

Reference: `docs/production/env.md`.

### Authentication and authorization

- [ ] Admin access requires a valid staff session.
- [ ] Sensitive admin pages and server actions rely on server-side guards, not middleware alone.
- [ ] Admin-only operations stay restricted to admin-capable roles where present.
- [ ] Public token routes do not expose internal notes, private files, staff metadata, or admin links.
- [ ] Login and public token routes keep rate limiting enabled.
- [ ] Bearer-style customer portal tokens are treated as sensitive links.

Reference: `docs/production/authz.md`.

### CSRF and request controls

- [ ] Admin mutating actions validate same-origin requests where the current CSRF guard applies.
- [ ] Allowed origins match the production domain.
- [ ] No broad wildcard origin is used for admin surfaces.
- [ ] Rate limiting is understood as in-memory for this baseline and is not treated as multi-instance safe.

Reference: `docs/production/security-controls.md`.

### Private files

- [ ] `PRIVATE_STORAGE_ROOT` points to a persistent server path or Docker volume.
- [ ] `PRIVATE_STORAGE_ROOT` is outside `public/` and outside the project root.
- [ ] Upload MIME allowlist and size limits are configured.
- [ ] Intake and ticket upload count limits are configured.
- [ ] Private file downloads require staff authorization.
- [ ] Private storage is included in the backup plan.

Reference: `docs/production/private-files.md`.

### Database integrity

- [ ] `npx prisma validate` passes.
- [ ] Production migrations are reviewed before deploy.
- [ ] Token uniqueness for public portal, quote, and invoice flows is preserved.
- [ ] Destructive schema changes are not part of this launch.
- [ ] Deferred indexes and constraints are tracked before larger data volume.
- [ ] Ticket, quote, invoice, payment, inventory, and event records preserve traceability.

Reference: `docs/production/database-integrity.md`.

### Backups and restore

- [ ] `npm run backup:db` command is known and tested in the target environment.
- [ ] `npm run backup:storage` command is known and tested in the target environment.
- [ ] Backups are stored outside Git.
- [ ] Backups do not include `.env` or secrets.
- [ ] A restore drill has been performed against a temporary database and temporary storage directory.
- [ ] Offsite encrypted backup destination is chosen before relying on the system for real workshop history.

Reference: `docs/production/backups-restore.md`.

### Observability

- [ ] `GET /api/health` returns `status`, `database`, `storage`, and `timestamp`.
- [ ] Healthcheck does not expose secrets, filesystem paths, customer data, stack traces, or connection strings.
- [ ] Production logs avoid passwords, cookies, portal tokens, raw request bodies, and private file paths.
- [ ] Critical failures are visible enough to diagnose auth, file, PDF, payment, worker, backup, and health issues.
- [ ] Minimum uptime monitoring or manual check cadence is defined.

Reference: `docs/production/observability.md`.

### Docker and VPS

- [ ] `docker-compose.production.yml` is reviewed separately from local `docker-compose.yml`.
- [ ] PostgreSQL is not exposed publicly.
- [ ] The app binds to `127.0.0.1:${APP_PORT:-3000}` behind a reverse proxy.
- [ ] Reverse proxy terminates TLS and forwards to the app.
- [ ] Persistent volumes exist for PostgreSQL, private storage, and backups.
- [ ] Migrations run explicitly through the `migrate` service before app rollout.
- [ ] A rollback path exists: previous image/commit, fresh backup, and migration decision.

Reference: `docs/production/vps-deploy.md`.

### Tests and validation

Run before a stable handoff:

```txt
npx prisma validate
npm run lint
npx tsc --noEmit
npm run test
```

Run when the deployment environment is ready:

```txt
npm run build
docker compose -f docker-compose.production.yml config --quiet
curl -fsS http://127.0.0.1:3000/api/health
```

Reference: `docs/production/test-validation.md`.

## Deployment sequence

Recommended first production rollout:

1. Confirm working tree and intended commit range.
2. Create or update `.env.production` on the VPS.
3. Run backup of any existing production DB and private storage.
4. Build the production image.
5. Start PostgreSQL.
6. Run migrations explicitly.
7. Start or restart the app.
8. Confirm `/api/health`.
9. Confirm login works with a staff account.
10. Confirm the main workshop flow manually:
    - intake;
    - ticket;
    - quote;
    - invoice;
    - payment;
    - customer portal;
    - public quote/invoice PDF.
11. Confirm private file upload and authorized download.
12. Monitor logs for auth, PDF, storage, worker, and health failures.

## Post-launch checklist

Within the first day:

- [ ] Confirm backups completed after real data entered the system.
- [ ] Download and verify backup artifacts exist.
- [ ] Check private storage volume growth.
- [ ] Check health endpoint at least once after a restart.
- [ ] Review logs for repeated auth, upload, PDF, or worker errors.
- [ ] Confirm customer portal links still work after deploy.

Within the first week:

- [ ] Run a restore drill against a temporary target.
- [ ] Review whether in-memory rate limiting is enough for the traffic pattern.
- [ ] Review whether deferred database indexes should be added.
- [ ] Decide offsite encrypted backup destination.
- [ ] Define basic uptime alerting.

## No-go conditions

Do not launch if any of these are true:

- `AUTH_SECRET` is missing or still a placeholder.
- PostgreSQL is publicly exposed.
- Private uploads are stored under `public/`.
- Admin routes rely only on middleware without server-side guards for sensitive data.
- Production origin values still point to localhost.
- Backups cannot be created.
- Restore has never been tested against a temporary target.
- `npm run test`, lint, typecheck, or Prisma validation fails without a documented accepted reason.
- Customer portal exposes internal notes, private files, or staff-only details.
- The system is being marketed as a SaaS platform before internal workshop validation.

## Deferred after launch

These are important, but not blockers for a controlled first workshop deployment if risk is accepted:

- shared production rate-limit store;
- automated offsite encrypted backups;
- browser E2E suite for workshop flows;
- Docker build in CI;
- structured logging implementation across all sensitive flows;
- alerting provider selection;
- token expiration and rotation policy for customer portal links;
- non-destructive Prisma migration for deferred indexes;
- cloud object storage provider decision.

## Final readiness statement

FengzLab / RepairLab is ready for a controlled production launch only when this checklist is complete or every open item has an explicit owner, risk acceptance, and follow-up date.
