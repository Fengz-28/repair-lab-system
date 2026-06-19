# FengzLab Operations V0

Actualizado: 2026-06-19, America/Costa_Rica.

## Purpose

This document defines the first practical operating routine for using FengzLab / RepairLab in the real workshop.

The goal is not to run a SaaS product. The goal is to run the workshop with better control, traceability, customer trust, and safer data handling.

## Operating mode

Current mode:

```txt
Home-hosted staging through Cloudflare Tunnel
Public URL: https://staging.fengzlab.tech
Local origin: http://localhost:3001
```

This mode is acceptable for controlled validation and early workshop operation only if backups, auth, healthcheck, and manual QA pass.

## Daily opening checklist

Before receiving devices or entering real data:

- [ ] Confirm workstation is powered, stable, and will not sleep.
- [ ] Confirm PostgreSQL is running.
- [ ] Confirm app is running on port `3001`.
- [ ] Confirm Cloudflare Tunnel is healthy if staging is needed.
- [ ] Confirm `/api/health` returns `ok` locally.
- [ ] Confirm staff login works.
- [ ] Confirm `/admin/tickets`, `/admin/intake`, and `/admin/dashboard` keep session after refresh.
- [ ] Confirm private storage path is available.
- [ ] Confirm the latest backup exists before entering important data.

## Intake routine

For every device received:

- Create or select the customer.
- Register the device with brand/model and serial when available.
- Capture the reported issue in plain language.
- Record accessories received.
- Record visible condition.
- Upload photos only when useful and safe.
- Create the repair ticket.
- Give the customer a clear expectation: diagnosis, quote, repair, payment, delivery.

Do not rely on WhatsApp notes, loose paper, or memory as the source of truth once the ticket exists.

## Diagnosis routine

For each ticket under diagnosis:

- Record symptoms confirmed.
- Record likely cause or uncertainty.
- Record parts needed if known.
- Decide whether the customer needs a quote before repair.
- Keep internal technical notes private.
- Move the ticket to the next status only when the next action is clear.

The main question for every ticket is:

```txt
What is the current state of this repair and what should happen next?
```

## Quote routine

Before asking for approval:

- Add service/labor lines.
- Add parts/product lines when relevant.
- Confirm total is greater than zero.
- Write customer-facing notes clearly.
- Keep internal notes out of the customer-facing copy.
- Generate or review the quote PDF.
- Confirm portal quote visibility if the customer will use the tracking link.

Do not promise uncertain repairs as guaranteed outcomes.

## Repair routine

During repair work:

- Record work performed.
- Record parts used.
- Record tests completed.
- Record remaining issue or risk if any.
- Update status when the repair moves forward.
- Preserve technical history for future warranty or repeat cases.

## Invoice and payment routine

Before delivery:

- Confirm invoice lines match the approved work.
- Confirm payments received.
- Register partial payments if needed.
- Confirm remaining balance is visible.
- Do not deliver a device as fully paid unless balance is actually settled.

## Delivery routine

At pickup or delivery:

- Confirm customer/device identity.
- Confirm payment state.
- Confirm final condition and basic tests.
- Record pickup/delivery notes if useful.
- Close or mark the ticket delivered.
- Mark content opportunity only if safe and useful.

## Customer portal routine

Use the portal to reduce confusion and build trust.

Customer-visible information should be:

- repair status;
- device summary;
- quote or invoice access;
- clear next step;
- contact guidance.

Never expose:

- internal notes;
- private file paths;
- inventory cost;
- secrets;
- stack traces;
- customer data from another ticket.

## Backup routine

Minimum routine while home-hosted:

- Run a full backup before important staging/real-use sessions.
- Run a full backup after any day with real workshop data.
- Copy backups off the workstation to an encrypted external location.
- Keep DB and storage backups from the same general time window.
- Treat untested backups as incomplete protection.

Commands:

```txt
npm run backup:db
npm run backup:storage
npm run backup
```

Do not restore over active data without explicit approval and a fresh backup.

## End-of-day checklist

Before closing the day:

- [ ] Review tickets waiting for customer approval.
- [ ] Review tickets waiting for parts.
- [ ] Review tickets ready for pickup.
- [ ] Review unpaid or partially paid invoices.
- [ ] Run backup if real data changed.
- [ ] Copy important backups off the workstation.
- [ ] Record any operational issue found during the day.

## Content opportunity routine

Repair data can support marketing only after human review.

Good content candidates:

- common repair issue;
- clear before/after result;
- educational explanation;
- diagnostic lesson;
- proof of professional process.

Rules:

- Never expose customer personal data.
- Never expose serial numbers or private device information.
- Never publish automatically.
- Keep claims realistic.
- Use real workshop proof, not exaggerated marketing language.

## No-go conditions

Do not use the system with real customer data if:

- login sessions fail on protected routes;
- `/api/health` is degraded;
- private uploads are not protected;
- backups are missing;
- `AUTH_SECRET` is unset or unstable;
- `APP_URL` points to localhost while using staging;
- portal or PDFs expose private/internal information;
- Cloudflare Tunnel is unstable during customer-facing use.

## Future upgrade triggers

Move from home-hosted staging toward VPS or a more permanent production setup when:

- the workshop workflow is used consistently;
- backup and restore drill are proven;
- monitoring/alerts are configured;
- customer portal and PDFs pass manual QA;
- the workstation setup becomes an availability bottleneck;
- real operations justify the infrastructure cost.
