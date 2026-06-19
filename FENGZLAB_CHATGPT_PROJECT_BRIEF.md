# FengzLab / RepairLab - Project Brief for a Temporary Chat

Use this file as a snapshot of the project when starting a temporary ChatGPT conversation.
Do not assume missing features. Treat the current docs and code as the source of truth.

## 1. What this project is

FengzLab / RepairLab is a self-hosted repair management system for an electronics repair workshop.
It is workshop-first, not SaaS-first.

Primary purpose:

- receive devices;
- create and track tickets;
- manage diagnostics;
- prepare quotes;
- generate invoices;
- record manual payments and balances;
- track inventory and spare parts;
- keep customer communication organized;
- support customer-facing repair status pages;
- produce safe marketing content from real completed repairs later.

Secondary purpose:

- help the workshop operate faster and more professionally;
- generate trust with customers;
- become the operational source of truth for the shop.

Future possible purpose:

- if the internal system proves valuable, it may later become a commercial product.

## 2. What it is not

Do not treat this as:

- a generic SaaS platform;
- a multi-tenant product;
- an investor-style startup;
- an AI-first automation system;
- a public subscription business;
- a demo app meant to stay fake;
- a system where external tools own the business state.

## 3. Current strategic posture

The project has already moved past prototype territory.
It now has a broad workshop operating surface and production-prep documentation.

Current posture:

- workshop-first;
- single-workshop internal system;
- public customer portal only for status and documents;
- production hardening is ongoing;
- final production is still no-go until staging, restore, monitoring, and deployment checks are done in the real environment.

## 4. Core stack

Current stack:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- pgvector ready in the local compose setup
- Docker for local and production-friendly deployment

Important implementation rule:

- PostgreSQL is the source of truth.
- External services should not become the main record of business state.

## 5. High-level architecture

The app is organized as a layered Next.js system:

- `src/app`: public routes, admin routes, portal routes, PDFs, and healthcheck.
- `src/components`: reusable UI and workshop-specific presentation components.
- `src/modules`: domain flows and feature logic.
- `src/server`: auth, storage, security, database, and other server-only concerns.
- `prisma`: schema and migrations.
- `docs`: product, architecture, security, production, and roadmap docs.
- `scripts`: backup, worker, and operational helpers.

Core design principle:

- UI should not talk to Prisma directly.
- server-side cases and services should own mutation logic.
- integrations should stay behind adapters and event flows.

## 6. Main product flows

Primary flows already in the system:

- intake and device reception;
- ticket creation and ticket lifecycle;
- quote creation and approval tracking;
- invoice creation and payment recording;
- inventory consumption and stock visibility;
- customer portal by token;
- PDFs for quotes and invoices;
- admin dashboard and customer records;
- login and staff authorization;
- local outbox worker for integration events;
- backups and restore planning;
- healthcheck and production readiness docs.

The workshop model is the real product.
The software is there to reduce friction in daily repair operations.

## 7. Public and private surfaces

Public surfaces:

- landing page;
- services page;
- products page;
- contact page;
- login page;
- customer portal by token;
- public quote PDF;
- public invoice PDF;
- healthcheck.

Private surfaces:

- admin dashboard;
- ticket detail;
- intake;
- customers;
- messages;
- catalog;
- inventory;
- file download routes for private assets;
- server actions and internal operations.

Important boundary:

- customer-visible routes must not expose internal notes, private file paths, stack traces, or staff-only data.

## 8. Production and infra state

Production-readiness work has already been documented in sections A-K and the production push goal.

Current status summary:

- environment safety documented;
- auth and authorization documented;
- CSRF and rate limiting documented;
- private file storage documented;
- database integrity documented;
- backups and restore documented;
- observability documented;
- Docker/VPS baseline documented;
- validation results documented;
- staging preflight documented;
- restore drill plan documented;
- monitoring plan documented;
- domain/VPS purchase checklist documented;
- final launch checklist documented.

Current go / no-go interpretation:

- GO for local validation;
- GO for staging validation;
- GO for Cloudflare Tunnel staging after a domain is available and secrets/origins are configured safely;
- GO for VPS purchase only if budget, renewal terms, and staging-first rules are accepted;
- NO-GO for final production with real customers.

Final production remains no-go until:

- staging deploy is completed;
- HTTPS and domain path are verified;
- restore drill against temporary DB/storage is completed;
- monitoring and alerts are configured;
- remaining runtime/UI/security changes are reviewed and committed or reverted cleanly.

Known build warning to keep in mind:

- Next.js build completed successfully, but one Turbopack/NFT warning remains around `private-storage.ts` and `/api/health`.

## 9. Key docs to read first

If you want to understand the project quickly, read these docs in order:

1. `docs/CURRENT_STATE.md`
2. `docs/SYSTEM_OVERVIEW.md`
3. `docs/WORKSHOP_FIRST_ROADMAP.md`
4. `docs/NEXT_STEPS.md`
5. `docs/production/README.md`
6. `docs/production/launch-checklist.md`
7. `docs/production/validation-results.md`

Supporting production docs:

- `docs/production/env.md`
- `docs/production/authz.md`
- `docs/production/security-controls.md`
- `docs/production/private-files.md`
- `docs/production/database-integrity.md`
- `docs/production/backups-restore.md`
- `docs/production/restore-drill.md`
- `docs/production/monitoring-plan.md`
- `docs/production/staging-preflight.md`
- `docs/production/domain-vps-purchase-checklist.md`
- `docs/production/vps-deploy.md`

## 10. Current operational risks

Important risks to remember:

- rate limiting is still in-memory and not multi-instance safe;
- customer portal tokens are bearer-style links and need careful handling;
- backup/restore exists but should still be drilled against temporary targets before real customers rely on it;
- monitoring is documented but still needs practical deployment in the real environment;
- the working tree may contain many UI and infra changes at once, so keep commits small and reviewable;
- any change touching auth, storage, payments, PDFs, or tickets can affect real workshop trust quickly.

## 11. How an AI should behave in this repo

When improving infra or code:

- read the current docs first;
- do not assume SaaS goals;
- do not invent features that are not implemented;
- do not invent secrets, domains, providers, or infrastructure;
- prefer minimal safe changes over broad rewrites;
- keep production work sectioned and reviewable;
- preserve the workshop-first direction;
- ask before making risky infra changes;
- keep customer data, private files, and auth paths protected;
- verify changes with lint, typecheck, tests, or targeted validation when relevant.

When asking for help from ChatGPT in a temporary chat:

- paste this brief first;
- then ask for one specific task or review;
- if the task depends on current code, ask the model to inspect the current repo state rather than guessing;
- if the task touches infra, ask it to stay within the documented production constraints.

## 12. Fast mental model

If you need the shortest possible summary:

```txt
FengzLab / RepairLab = a workshop-first repair OS for a real electronics repair shop.
PostgreSQL is the source of truth.
The repo has real workflows, not just UI.
Production prep is documented and staged, but final production is still no-go.
Keep changes small, safe, and operationally useful.
```

