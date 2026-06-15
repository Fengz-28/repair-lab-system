# Section B - Environment Variables and Config Safety

Actualizado: 2026-06-13, America/Costa_Rica.

## Objective

Audit environment variables and production config safety for FengzLab / RepairLab without changing application runtime behavior.

## Inspection summary

Files inspected:

- `.env.example`
- `package.json`
- `middleware.ts`
- `src/server/db/prisma.ts`
- `src/server/auth/local-admin.ts`
- `src/server/storage/private-storage.ts`
- `src/server/security/rate-limit.ts`
- `src/modules/email/email.service.ts`
- `src/components/dev/css-studio.tsx`
- `scripts/seed-admin.mjs`
- `scripts/backup-db.mjs`
- `scripts/backup-storage.mjs`
- `scripts/process-integration-events.mjs`
- `docs/production/README.md`

No centralized env validation file was found in `src/server` or `src/lib`.

## Variables actually used in code

```txt
ADMIN_EMAIL
ADMIN_NAME
ADMIN_PASSWORD
ALLOWED_UPLOAD_MIME_TYPES
APP_URL
AUTH_SECRET
DATABASE_URL
EMAIL_FROM
EMAIL_PROVIDER
EMAIL_PROVIDER_KEY
INTEGRATION_WORKER_BATCH_SIZE
INTEGRATION_WORKER_MAX_RETRIES
INTEGRATION_WORKER_STALE_PROCESSING_MINUTES
MAX_UPLOAD_FILE_SIZE_MB
MAX_UPLOAD_FILES_PER_INTAKE
MAX_UPLOAD_FILES_PER_TICKET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ENABLE_CSS_STUDIO
NODE_ENV
POSTGRES_CONTAINER_NAME
PRIVATE_STORAGE_ROOT
PUBLIC_SITE_URL
RATE_LIMIT_ENABLED
RATE_LIMIT_LOGIN_MAX_ATTEMPTS
RATE_LIMIT_LOGIN_WINDOW_SECONDS
RATE_LIMIT_PUBLIC_MAX_REQUESTS
RATE_LIMIT_PUBLIC_WINDOW_SECONDS
RESEND_API_KEY
SESSION_COOKIE_NAME
SMTP_FROM
```

`NODE_ENV` is supplied by the runtime and should not normally be set manually in `.env.example`.

## Comparison against `.env.example`

All code-used project variables are now represented in `.env.example`, except `NODE_ENV`, which is runtime-managed.

Added in this pass:

- `NEXT_PUBLIC_APP_URL`
- `POSTGRES_CONTAINER_NAME`

`.env.example` also includes future/optional variables that are not currently used by code. They are acceptable as placeholders for disabled integrations, but they must not be treated as implemented production features.

Examples:

- `WHATSAPP_*`
- `GOOGLE_CALENDAR_*`
- `N8N_*`
- `OLLAMA_*`
- `AI_*`
- `TRELLO_*`
- `S3_*`
- `SMTP_*`

## Classification

### Required for production

- `DATABASE_URL` - database connection string. Secret.
- `AUTH_SECRET` - signs local staff sessions. Secret. Must not equal `replace-with-local-secret`.
- `APP_URL` - canonical app URL for server-generated links.
- `PUBLIC_SITE_URL` - public site URL fallback for customer-facing links.
- `SESSION_COOKIE_NAME` - session cookie name. Not secret.
- `PRIVATE_STORAGE_ROOT` - private upload root. Must be persistent and outside `public/`.
- `ALLOWED_UPLOAD_MIME_TYPES` - allowed upload MIME list.
- `MAX_UPLOAD_FILE_SIZE_MB` - upload size guard.
- `MAX_UPLOAD_FILES_PER_INTAKE` - intake upload count guard.
- `MAX_UPLOAD_FILES_PER_TICKET` - ticket upload count guard.
- `RATE_LIMIT_ENABLED` - should stay `true` for exposed environments.
- `RATE_LIMIT_LOGIN_WINDOW_SECONDS`
- `RATE_LIMIT_LOGIN_MAX_ATTEMPTS`
- `RATE_LIMIT_PUBLIC_WINDOW_SECONDS`
- `RATE_LIMIT_PUBLIC_MAX_REQUESTS`

### Required only for local/dev

- `ADMIN_EMAIL` - used by `npm run seed:admin`.
- `ADMIN_PASSWORD` - used by `npm run seed:admin`. Secret. Must be strong even for exposed demos.
- `ADMIN_NAME` - used by `npm run seed:admin`.
- `POSTGRES_CONTAINER_NAME` - used by local DB backup helper. Default: `repair_lab_postgres`.
- `NEXT_PUBLIC_ENABLE_CSS_STUDIO` - dev-only CSS Studio toggle. Must remain `false` in production.

### Optional integration

- `EMAIL_PROVIDER` - supports `console`, `resend`, or `disabled`.
- `EMAIL_FROM`
- `EMAIL_PROVIDER_KEY` - secret if used.
- `RESEND_API_KEY` - secret if used.
- `SMTP_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER` - secret if used.
- `SMTP_PASSWORD` - secret if used.
- `WHATSAPP_*` - disabled placeholder.
- `GOOGLE_CALENDAR_*` - disabled placeholder.
- `N8N_*` - disabled placeholder. `N8N_WEBHOOK_SECRET` is secret if enabled.
- `AI_*` / `OLLAMA_*` - disabled/local placeholder.
- `TRELLO_*` - disabled placeholder.
- `S3_*` - future storage placeholder. Access keys are secrets if enabled.
- `INTEGRATION_WORKER_BATCH_SIZE`
- `INTEGRATION_WORKER_MAX_RETRIES`
- `INTEGRATION_WORKER_STALE_PROCESSING_MINUTES`

### Public browser-safe

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ENABLE_CSS_STUDIO`

Only `NEXT_PUBLIC_*` variables should be considered browser-exposed by convention. `NEXT_PUBLIC_ENABLE_CSS_STUDIO` must be `false` outside local development.

### Secret

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_PASSWORD`
- `EMAIL_PROVIDER_KEY`
- `RESEND_API_KEY`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `N8N_WEBHOOK_SECRET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `TRELLO_API_KEY`
- `TRELLO_TOKEN`

## Dangerous placeholders

Must be replaced before any exposed production or ngrok-like environment:

- `AUTH_SECRET=replace-with-local-secret`
- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=replace-with-local-admin-password`
- `N8N_WEBHOOK_SECRET=replace-with-local-webhook-secret`
- `DATABASE_URL=postgresql://repairlab:repairlab_password@localhost:5432/repairlab?schema=public`
- `EMAIL_FROM="Repair Lab <no-reply@example.com>"`
- `APP_URL=http://localhost:3000`
- `PUBLIC_SITE_URL=http://localhost:3000`
- `ADMIN_ALLOWED_ORIGINS=http://localhost:3000`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000`

Production should also avoid leaving enabled-but-empty providers. Keep unused providers explicitly `disabled`.

## Current safety notes

- `AUTH_SECRET` has a production guard in `src/server/auth/local-admin.ts`; production throws if it is missing or still `replace-with-local-secret`.
- `DATABASE_URL` is asserted in Prisma setup and required by scripts.
- Upload limits and MIME types have safe fallbacks, but production should still set them intentionally.
- Rate limiting defaults to enabled unless `RATE_LIMIT_ENABLED=false`.
- The current rate limiter is in-memory and therefore suitable only for a single Node process or local demo unless protected by a reverse proxy strategy.
- Email defaults to `console`; production email requires provider configuration before real customer messaging.

## Section B result

Smallest useful change completed:

- documented env safety in `docs/production/env.md`;
- added missing code-used names to `.env.example`;
- added a short Section B status note to `docs/production/README.md`.

No runtime behavior was changed.
