# Section I - Docker and VPS Deployment

Status: production deployment baseline added for a simple single-VPS setup.

## Goal

Run FengzLab / RepairLab on one VPS with:

- Next.js app behind an HTTPS reverse proxy;
- PostgreSQL internal to Docker;
- private uploads in a persistent Docker volume;
- local backup output in a persistent Docker volume;
- explicit Prisma migrations;
- no public PostgreSQL port;
- no Kubernetes or multi-node orchestration.

## Files

Production compose file:

```txt
docker-compose.production.yml
```

This file is separate from the local/demo `docker-compose.yml`.

## Environment

Use an uncommitted production env file:

```txt
.env.production
```

Run production compose commands with:

```txt
docker compose --env-file .env.production -f docker-compose.production.yml <command>
```

Minimum required values:

```txt
POSTGRES_PASSWORD=<strong database password>
APP_URL=https://your-domain.example
PUBLIC_SITE_URL=https://your-domain.example
ADMIN_ALLOWED_ORIGINS=https://your-domain.example
CORS_ALLOWED_ORIGINS=https://your-domain.example
AUTH_SECRET=<strong random secret>
```

Do not commit `.env.production`.

## Build

```txt
docker compose --env-file .env.production -f docker-compose.production.yml build
```

## Start PostgreSQL

```txt
docker compose --env-file .env.production -f docker-compose.production.yml up -d postgres
```

## Run migrations

Run migrations explicitly before starting or updating the app:

```txt
docker compose --env-file .env.production -f docker-compose.production.yml --profile ops run --rm migrate
```

Do not run migrations blindly during a high-risk deploy window. Confirm backups exist first.

## Start app

```txt
docker compose --env-file .env.production -f docker-compose.production.yml up -d app
```

The app binds to localhost only by default:

```txt
127.0.0.1:3000 -> app:3000
```

This expects a reverse proxy on the VPS to terminate HTTPS and forward to `127.0.0.1:3000`.

## Healthcheck

Container healthcheck:

```txt
GET http://localhost:3000/api/health
```

Manual VPS check:

```txt
curl -fsS http://127.0.0.1:3000/api/health
```

Expected healthy response includes:

- `status: ok`
- `database: ok`
- `storage: ok`

It must not expose secrets, filesystem paths, customer data, or stack traces.

## Reverse proxy

Use Caddy or Nginx on the host. The proxy should:

- terminate TLS;
- redirect HTTP to HTTPS;
- proxy to `127.0.0.1:3000`;
- preserve `Host`;
- set `X-Forwarded-Proto`;
- set `X-Forwarded-For`;
- avoid exposing PostgreSQL.

Conceptual Caddy route:

```txt
your-domain.example {
  reverse_proxy 127.0.0.1:3000
}
```

Replace `your-domain.example` with the real domain only when it exists.

## Persistent volumes

Production compose defines:

- `repair_lab_pgdata` for PostgreSQL data;
- `repair_lab_storage` for private uploads;
- `repair_lab_backups` for local backup output.

These volumes must be included in backup and restore planning.

## PostgreSQL exposure

`docker-compose.production.yml` does not publish PostgreSQL to the public host network.

Access PostgreSQL through Docker internal networking only unless a specific maintenance procedure explicitly requires otherwise.

## Backups

Run local backups from the app container or with the repo scripts when the Docker context is available.

Backups are still local to the VPS unless copied elsewhere. Section G documents the external encrypted backup requirement.

## Worker

`npm run worker:events` is still a run-once worker command.

Section I does not add a scheduler or daemon. If the worker is needed in production, run it through a supervised scheduler or process manager in a later scoped pass.

## Deployment checklist

Before exposing the app:

- `.env.production` exists and is not committed;
- `AUTH_SECRET` is strong and not a placeholder;
- `POSTGRES_PASSWORD` is strong and not a demo password;
- `APP_URL` and `PUBLIC_SITE_URL` use HTTPS;
- reverse proxy TLS works;
- `docker compose ... build` succeeds;
- migrations have been applied explicitly;
- `/api/health` returns `ok`;
- database backup succeeds;
- private storage backup succeeds;
- restore drill has been tested against a temporary target.

## Deferred risks

- No external backup upload is configured.
- No production monitoring provider is configured.
- No deployment automation or rollback script is provided.
- No worker scheduler is configured.
- Rate limiting is still in-memory.
- Production secrets management is manual.
- Caddy/Nginx config is documented conceptually but not versioned as an active host config.
