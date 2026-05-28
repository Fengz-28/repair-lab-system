# RepairLab Activity Timeline Plan

RepairLab already stores operational history across tickets, status history, ticket events, invoices, payments, files, messages, and inventory movements. The Activity Timeline layer should turn those records into a human-readable operational stream without becoming a second source of truth.

## Goal

Activity Timeline should help staff understand what happened, what changed, and what likely needs attention next. It is a UX layer over existing business data, not a replacement for audit logs, financial records, message logs, or lifecycle rules.

## Where It Should Appear

Initial surfaces:

- Ticket detail: repair activity, quote milestones, invoice/payment milestones, files, messages, current status.
- Customer detail: recent tickets, invoices, payments, messages, devices.
- Dashboard: recent cross-business activity.

Future surfaces:

- Messages detail: delivery attempts and provider events.
- Inventory/catalog: stock movements and low-stock events.
- Notifications Center: high-priority activity summaries.

## Event Types

Ticket-oriented events:

- ticket created
- status changed
- diagnosis started or updated
- quote created
- quote sent
- quote approved/rejected/expired
- invoice generated
- payment registered
- file attached
- message sent
- ticket ready for pickup
- ticket delivered/cancelled

Customer-oriented events:

- customer created through intake
- new device registered
- new ticket opened
- invoice issued
- payment received
- message generated
- ticket closed

Inventory-oriented events:

- stock in
- stock out
- automatic stock deduction
- low stock reached
- stock exhausted

## Data Available Today Without a New Table

Ticket detail can derive activity from:

- `Ticket.createdAt`, `Ticket.updatedAt`, `Ticket.status`
- `TicketStatusHistory`
- `TicketEvent`
- `TicketComment`
- `FileAsset`
- `MessageLog`
- `Invoice` records for quotes and internal invoices

Customer detail can derive activity from:

- related tickets
- related invoices
- related payments through invoices
- related messages
- related devices

Dashboard can derive activity from:

- recent tickets
- recent messages
- invoices/payments
- inventory movements

This mode is called derived/static because the timeline is assembled at render time from existing records. It does not persist a new timeline row.

## When To Add `ActivityEvent`

Create a dedicated `ActivityEvent` table only when the derived approach becomes hard to maintain or too slow. Good triggers:

- dashboard needs a single chronological stream across many aggregates
- activity must support read/unread state
- events need severity, assignment, snooze, or notification behavior
- multiple external systems need idempotent timeline publishing
- querying many tables becomes a performance bottleneck

Possible future fields:

- `id`
- `type`
- `severity`
- `actorId`
- `aggregateType`
- `aggregateId`
- `ticketId`
- `customerId`
- `invoiceId`
- `title`
- `description`
- `metadata`
- `visibility`
- `createdAt`

## Security And Audit Risks

- Do not show internal notes in customer-facing timelines.
- Do not duplicate audit logs as editable UX records.
- Do not expose private files, provider payloads, stack traces, or secrets.
- Distinguish internal timeline from public tracking timeline.
- Avoid treating derived timeline as legal/audit truth; PostgreSQL domain tables remain the source of truth.
- If an `ActivityEvent` table is added later, define idempotency and retention rules.

## Acceptance Criteria

Activity Timeline v1 is acceptable when:

- It uses existing data only.
- It does not require Prisma schema changes.
- It renders an empty state when no events are available.
- It uses clear human labels instead of raw enums.
- It is mobile-friendly.
- It does not expose internal data in public routes.
- It can be reused for ticket and customer pages.

Activity Timeline v2 is acceptable when:

- A schema change is justified by query complexity or product behavior.
- Event visibility is defined.
- Authorization is enforced near data access.
- Integration events and audit logs remain separate concepts.
