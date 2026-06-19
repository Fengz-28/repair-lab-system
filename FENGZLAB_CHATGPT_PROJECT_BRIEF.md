# FengzLab / RepairLab - Project Brief for a Temporary Chat

Use this file as a current snapshot when starting a temporary ChatGPT conversation.
Do not assume missing features. Treat the current repo, docs, and committed history as the source of truth.

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
- generate customer trust with traceable status and documents;
- support safe marketing/content workflows from real completed repairs later.

Secondary purpose:

- help the workshop operate faster and more professionally;
- become the operational source of truth for the shop;
- validate the system internally before any future commercial product idea.

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

## 3. Current operational posture

Current strategy:

```txt
Home-hosted early production validation through Cloudflare Tunnel.
Public staging URL: https://staging.fengzlab.tech
Local origin: http://localhost:3001
```

Known current state:

- domain `fengzlab.tech` is active in Cloudflare;
- Cloudflare Tunnel routes staging to the local origin;
- app loads through staging;
- login redirect bug was fixed and committed;
- protected admin routes preserve the intended `next` redirect after staff login;
- CSS Studio was removed from runtime/production code;
- the previous Turbopack/NFT healthcheck warning has been resolved;
- final production with real customers is still no-go until manual staging QA, restore drill, and monitoring are completed.

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
- `src/server`: auth, storage, security, database, and server-only concerns.
- `prisma`: schema and migrations.
- `docs`: product, architecture, security, production, and roadmap docs.
- `scripts`: backup, worker, and operational helpers.

Core design principle:

- UI should not talk to Prisma directly.
- Server-side cases and services should own mutation logic.
- Integrations should stay behind adapters and event flows.

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

The workshop model is the real product. The software exists to reduce friction in daily repair operations.

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

Production-readiness work has been documented in sections A-K plus the current home-hosted tunnel readiness pass.

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
- final launch checklist documented;
- home-hosted Cloudflare Tunnel plan documented;
- manual QA checklist documented;
- FengzLab Operations V0 documented.

Current go / no-go interpretation:

- GO for local validation;
- GO for Cloudflare Tunnel staging with correct env, Cloudflare Access, and stable secrets;
- GO for controlled early workshop validation only after backup and manual QA checks pass;
- GO for VPS purchase only if budget, renewal terms, and staging-first rules are accepted;
- NO-GO for final production with real customers until restore drill and monitoring are completed.

Final production remains no-go until:

- staging/manual QA passes through the public staging URL;
- HTTPS and domain path are verified;
- restore drill against temporary DB/storage is completed;
- monitoring and alerts are configured;
- remaining runtime/UI/security changes are reviewed and committed or reverted cleanly.

## 9. Recent commits to know

Recent relevant commits:

```txt
2b403e4 docs: add FengzLab operations v0
055cb9c docs: update home-hosted backup and restore drill plan
d087824 docs: add staging and tunnel preflight checklist
8693f8f docs: add home-hosted tunnel production plan
7186622 fix: scope healthcheck storage checks
4fdc3fe chore: ignore local AI and IDE tooling
d805746 docs: add FengzLab ChatGPT project brief
c9c4ff8 chore: remove cssstudio dev tooling
cef490a fix: preserve admin redirect after staff login
46a3654 chore: update frontend visual dependencies
```

Note: exact history should be verified with `git log --oneline` because the repo may have advanced.

## 10. Key docs to read first

If you want to understand the project quickly, read these docs in order:

1. `docs/FENGZLAB_OPERATIONS_V0.md`
2. `docs/production/home-hosted-tunnel.md`
3. `docs/production/staging-preflight.md`
4. `docs/production/manual-qa.md`
5. `docs/production/README.md`
6. `docs/production/launch-checklist.md`
7. `docs/production/validation-results.md`
8. `docs/WORKSHOP_OPERATING_MODEL.md`
9. `docs/CURRENT_STATE.md`
10. `docs/SYSTEM_OVERVIEW.md`

Supporting production docs:

- `docs/production/env.md`
- `docs/production/authz.md`
- `docs/production/security-controls.md`
- `docs/production/private-files.md`
- `docs/production/database-integrity.md`
- `docs/production/backups-restore.md`
- `docs/production/restore-drill.md`
- `docs/production/monitoring-plan.md`
- `docs/production/domain-vps-purchase-checklist.md`
- `docs/production/vps-deploy.md`

## 11. Current operational risks

Important risks to remember:

- rate limiting is still in-memory and not multi-instance safe;
- customer portal tokens are bearer-style links and need careful handling;
- backup/restore exists but restore drill still needs to run against temporary targets before final production;
- monitoring is documented but still needs practical deployment in the real environment;
- home-hosted staging depends on workstation power, internet, router, OS updates, and Cloudflare Tunnel health;
- any change touching auth, storage, payments, PDFs, or tickets can affect real workshop trust quickly.

## 12. Validation snapshot

Most recent validation during the home-hosted readiness pass:

```txt
npm run lint: passed
npx tsc --noEmit: passed
npm run test: passed
npm run build: passed
```

The previous Turbopack/NFT healthcheck warning was resolved by scoping the private storage root helper used by `/api/health`.

## 13. Safe next prompt for a temporary chat

Use this kind of prompt:

```txt
You are helping with FengzLab / RepairLab, a workshop-first Next.js/Prisma repair management system.
Read FENGZLAB_CHATGPT_PROJECT_BRIEF.md first.
Then inspect only the files needed for the task.
Do not assume SaaS, multi-tenant, or AI-heavy goals.
Do not modify Prisma, secrets, DNS, Cloudflare, or Docker unless explicitly requested.
Keep changes small, committed, and validated.
```

Recommended next tasks:

- run the manual QA checklist against `https://staging.fengzlab.tech`;
- execute a restore drill against temporary DB/storage targets only;
- configure practical monitoring/alerts;
- review remaining public UI copy for FengzLab-first consistency;
- keep committing small, scoped changes.

## 14. How an AI should behave in this repo

When improving infra or code:

- read the current docs first;
- inspect the real filesystem before summarizing;
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

- paste or attach this brief first;
- then ask for one specific task or review;
- if the task depends on current code, ask the model to inspect the current repo state rather than guessing;
- if the task touches infra, ask it to stay within the documented production constraints.

## 15. Fast mental model

```txt
FengzLab / RepairLab = a workshop-first repair OS for a real electronics repair shop.
PostgreSQL is the source of truth.
The repo has real workflows, not just UI.
Current path is home-hosted staging through Cloudflare Tunnel.
Final production is still no-go until manual QA, restore drill, and monitoring are done.
Keep changes small, safe, and operationally useful.
```
