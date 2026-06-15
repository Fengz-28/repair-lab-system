# Section J - Tests and Validation

Status: production-critical test coverage reviewed and lightly expanded.

## Current test setup

Test runner:

```txt
npm run test
```

Underlying command:

```txt
vitest run
```

Vitest configuration:

- environment: `node`
- include pattern: `src/**/*.test.ts`

## Existing coverage

Existing tests cover:

- inventory stock movement rules;
- manual payment totals and payment status mapping;
- ticket status transition rules;
- quote lifecycle rules;
- IntegrationEvent/outbox retry and unsupported-event behavior.

## Coverage added in Section J

Added tests for:

- rate limit counters, reset behavior, disabled mode, and env override parsing;
- private storage upload validation, max upload size, storage key sanitization, and unsafe root rejection.

New files:

- `src/server/security/rate-limit.test.ts`
- `src/server/storage/private-storage.test.ts`

## Production-critical validation commands

Recommended local validation before a stable handoff:

```txt
npx prisma validate
npm run lint
npx tsc --noEmit
npm run test
```

For deployment readiness, also run when time and environment allow:

```txt
npm run build
docker compose -f docker-compose.production.yml config --quiet
```

For Docker/PostgreSQL environments:

```txt
npx prisma migrate status
docker compose ps
docker compose exec -T app npx prisma migrate status
docker compose exec -T app npm run worker:events
curl http://localhost:3000/api/health
```

## What is not covered yet

Deferred coverage:

- browser E2E for intake -> ticket -> quote -> invoice -> payment;
- customer portal token flow;
- public quote/invoice PDF download flow;
- private file download route with an authenticated session;
- Docker build in CI;
- production reverse proxy/TLS smoke checks;
- backup and restore drill automation;
- Prisma integration tests against a disposable database.

## Testing policy

Prefer focused tests for:

- pure business rules;
- security helpers;
- file/path safety;
- token and rate-limit behavior;
- payment and inventory invariants;
- outbox retry rules.

Avoid broad tests that require real customer data, real external providers, or destructive database restore operations.
