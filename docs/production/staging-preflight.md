# Staging and VPS Preflight

Status: planning document only. No domain, VPS, secrets, or deployment has been configured.

## Purpose

Use this checklist before buying a domain, renting a VPS, or exposing FengzLab / RepairLab outside a controlled local environment.

The first target is a staging deployment. Production with real customer data should wait until staging validates the deploy path, backups, restore drill, HTTPS, monitoring, and the core workshop workflow.

## Recommended VPS minimum specs

Minimum for a small workshop-first deployment:

- 2 vCPU
- 4 GB RAM
- 60 GB SSD storage
- Ubuntu LTS or another stable Linux distribution
- Docker Engine with Docker Compose plugin
- SSH access with key-based login

Recommended if budget allows:

- 4 GB to 8 GB RAM
- 80 GB or more SSD storage
- provider snapshot support
- basic firewall controls
- private network disabled unless intentionally used

Avoid starting with Kubernetes, managed clusters, or multi-node architecture. A single VPS is enough for the current workshop-first goal.

## OS assumption

Assume Ubuntu LTS on a clean VPS.

Required base packages:

```txt
docker
docker compose plugin
git
curl
ufw or equivalent firewall
tar
gzip
```

Do not install application secrets into shell history. Use an uncommitted `.env.production` file with restricted permissions.

## Required DNS records

Do not configure DNS until a domain is chosen.

Expected records:

| Type | Name | Target | Purpose |
| --- | --- | --- | --- |
| `A` | `fengzlab.example` | VPS public IPv4 | Primary site and app origin |
| `A` or `CNAME` | `www.fengzlab.example` | primary domain | Optional public alias |

If using a staging subdomain:

| Type | Name | Target | Purpose |
| --- | --- | --- | --- |
| `A` | `staging.fengzlab.example` | VPS public IPv4 | First deploy target |

Use the real domain only after staging behavior is validated.

## Required ports

Open publicly:

- `80/tcp` for HTTP challenge and redirect to HTTPS
- `443/tcp` for HTTPS

Restrict:

- `22/tcp` to trusted IPs when possible

Do not expose publicly:

- PostgreSQL
- Docker daemon
- private storage volume
- local Ollama or AI services
- n8n unless explicitly planned later with auth, TLS, logging, and rollback

The Next.js app should stay bound to `127.0.0.1:${APP_PORT:-3000}` behind the reverse proxy.

## Required environment variables

Create `.env.production` on the VPS and do not commit it.

Minimum required values:

```txt
POSTGRES_PASSWORD=<strong database password>
DATABASE_URL=<postgres connection string for the compose network>
AUTH_SECRET=<strong random secret>
APP_URL=https://staging-or-production-domain
PUBLIC_SITE_URL=https://staging-or-production-domain
NEXT_PUBLIC_APP_URL=https://staging-or-production-domain
ADMIN_ALLOWED_ORIGINS=https://staging-or-production-domain
CORS_ALLOWED_ORIGINS=https://staging-or-production-domain
PRIVATE_STORAGE_ROOT=/app/storage/private
RATE_LIMIT_ENABLED=true
```

Review `docs/production/env.md` before filling values.

## Secrets checklist

Before first deploy:

- [ ] `AUTH_SECRET` is not a placeholder.
- [ ] `POSTGRES_PASSWORD` is strong and unique.
- [ ] `DATABASE_URL` does not use local demo credentials.
- [ ] `.env.production` is not committed.
- [ ] `.env.production` file permissions are restricted on the server.
- [ ] No real secrets are pasted into docs, tickets, screenshots, prompts, or logs.
- [ ] Optional integrations remain disabled unless fully planned.
- [ ] Admin seed credentials are changed before any exposed environment.

## Reverse proxy choice

Preferred: Caddy.

Why:

- simple automatic HTTPS;
- concise config;
- good fit for a single-VPS first deploy;
- fewer moving parts for staging.

Nginx is acceptable if it is already preferred or already managed.

Reverse proxy requirements:

- terminate TLS;
- redirect HTTP to HTTPS;
- proxy to `127.0.0.1:${APP_PORT:-3000}`;
- preserve `Host`;
- set `X-Forwarded-Proto`;
- avoid exposing internal ports.

## Backup volume plan

Use persistent Docker volumes or explicit host paths for:

- PostgreSQL data;
- private upload storage;
- local backup output.

Before first real data:

- [ ] Confirm DB backup command works.
- [ ] Confirm storage backup command works.
- [ ] Confirm backup artifacts are outside Git.
- [ ] Choose an offsite encrypted backup destination.
- [ ] Define retention policy.

Reference: `docs/production/backups-restore.md`.

## Private upload volume plan

Private uploads must stay outside public web routes.

Staging rules:

- use persistent storage;
- do not store uploads under `public/`;
- do not serve files directly from the filesystem;
- keep access through authorized routes only;
- include upload storage in backup plan.

Reference: `docs/production/private-files.md`.

## Migration strategy

Use explicit migration execution.

Do not run migrations blindly during deploy.

Recommended sequence:

1. Confirm a current DB backup exists.
2. Review pending migrations.
3. Start PostgreSQL.
4. Run the compose `migrate` service.
5. Start or restart the app.
6. Check `/api/health`.

Do not modify Prisma schema during the first staging deploy unless the migration was already reviewed and committed.

## First deploy sequence

Staging deploy sequence:

1. Provision VPS.
2. Configure SSH access.
3. Install Docker and Docker Compose plugin.
4. Clone repository.
5. Create `.env.production` with staging domain values.
6. Build production image.
7. Start PostgreSQL.
8. Run migrations.
9. Start app.
10. Configure reverse proxy with HTTPS.
11. Check `GET /api/health`.
12. Seed or create one staff admin account.
13. Run manual QA sequence.
14. Confirm backups work.
15. Review logs for auth, storage, PDF, worker, and health failures.

Do not connect real customer traffic until this sequence passes.

## First manual QA sequence

Run this manually in staging:

- [ ] Public home loads over HTTPS.
- [ ] `/services`, `/products`, and `/contact` load over HTTPS.
- [ ] Staff login works.
- [ ] Admin dashboard loads.
- [ ] Intake can create a repair case.
- [ ] Ticket detail loads.
- [ ] Quote can be created or reviewed.
- [ ] Invoice/payment flow works for a test case.
- [ ] Customer portal token page loads.
- [ ] Public quote/invoice PDF route works.
- [ ] Private upload works.
- [ ] Private file download requires authorized staff.
- [ ] `/api/health` returns healthy status.
- [ ] No public page exposes secrets, stack traces, private files, or internal notes.

## Rollback plan

Before deploy:

- know the previous commit hash;
- keep a current DB backup;
- keep a current private storage backup;
- know whether migrations are reversible or require restore.

Rollback options:

1. Revert to previous app image or commit if no migration changed data.
2. Stop app and restore DB/storage to temporary targets for validation if data corruption is suspected.
3. Only restore active production data with explicit approval, a fresh backup, and a clearly named target.

Do not run restore commands against production as an experiment.

## What not to do on first deploy

- Do not expose PostgreSQL to the internet.
- Do not expose Docker daemon.
- Do not publish real secrets.
- Do not enable unused integrations.
- Do not launch n8n automation as source of truth.
- Do not expose Ollama or local AI services.
- Do not skip HTTPS.
- Do not use placeholder admin credentials.
- Do not skip backups.
- Do not use real customer data before staging checks pass.
- Do not market the system as a SaaS platform.

## Cost and risk notes

Known cost drivers:

- VPS monthly cost;
- domain renewal;
- backup storage;
- optional monitoring;
- future email/SMS/WhatsApp providers.

Known risks:

- in-memory rate limiting is not multi-instance safe;
- public portal tokens are bearer-style links;
- backup scripts are local/manual until scheduled externally;
- restore drill is still required;
- build currently passes with one Turbopack/NFT warning documented in `docs/production/validation-results.md`;
- manual QA is still required before real customer traffic.

## Staging-first rule

Staging is allowed when validation passes and no secrets are exposed.

Final production with real customers remains no-go until:

- staging deploy succeeds;
- HTTPS is active;
- backups are created;
- restore drill is completed against a temporary target;
- monitoring is configured;
- manual workshop workflow QA passes;
- launch checklist is updated with a current GO / NO-GO status.
