# RepairLab Notifications Center Plan

The Notifications Center is an internal UX layer for staff awareness. It should surface operational signals that deserve attention without becoming a second workflow engine or replacing dashboard lists.

## Goal

Give staff a compact place to notice urgent or time-sensitive work:

- low stock
- failed or pending messages
- tickets waiting for approval
- urgent open tickets
- future overdue repairs
- future invoice/payment alerts

Notifications should be actionable, clear, and non-destructive. Clicking a notification should navigate to the safest existing admin screen.

## Notification Types

Initial derived types:

- `LOW_STOCK`: tracked inventory at or below reorder level
- `MESSAGE_FAILED`: email/message failed
- `MESSAGE_PENDING`: queued message waiting for processing
- `TICKET_WAITING_APPROVAL`: repair waiting for customer approval
- `TICKET_URGENT`: open ticket with high priority

Future types:

- `INVOICE_OVERDUE`
- `PAYMENT_PENDING`
- `QUOTE_EXPIRING`
- `BACKUP_FAILED`
- `WORKER_FAILED`
- `STORAGE_WARNING`
- `INTEGRATION_EVENT_FAILED`

## Severities

- `info`: useful awareness, no immediate issue
- `success`: positive completion or recovery
- `warning`: needs review soon
- `error`: failed process or urgent operational risk

Severity should affect color, text, and ordering. Do not rely on color only.

## What Can Be Derived Today Without A New Table

The admin shell can derive a read-only notification list from existing tables:

- low stock from `CatalogItem` + `InventoryItem`
- pending/failed messages from `MessageLog`
- waiting approval tickets from `Ticket.status`
- urgent open tickets from `Ticket.priority`

This is not persisted and has no read/unread state. It is recalculated when the admin shell renders.

## When To Add A `Notification` Table

Add a real table when the product needs:

- read/unread state
- dismiss/snooze
- per-user notifications
- notification history
- delivery across email/WhatsApp/n8n
- idempotent notification creation
- notification retention policies

Possible future fields:

- `id`
- `type`
- `severity`
- `title`
- `description`
- `href`
- `userId`
- `role`
- `aggregateType`
- `aggregateId`
- `readAt`
- `dismissedAt`
- `createdAt`
- `metadata`

## Read/Unread Future

Read/unread should not be inferred from whether a user opened the dropdown. It should be explicit and persisted:

- mark one notification as read
- mark all as read
- optionally auto-read only after opening the linked object

This requires schema and authorization rules, so it is out of scope for v1.

## Security Risks

- Do not expose notifications in public routes.
- Do not include private file names or internal notes unless the recipient role is allowed.
- Do not put provider payloads, stack traces, secrets, or raw metadata in notification text.
- Do not let notification links bypass route authorization.
- Avoid leaking customer data in compact header text.

## Acceptance Criteria

Notifications Center v1 is acceptable when:

- It is visible only in the admin shell.
- It uses derived read-only data from existing tables.
- It has clear empty state.
- It uses severity styles with readable text.
- It links only to existing admin pages.
- It does not create models, migrations, or mutations.

Notifications Center v2 is acceptable when:

- A `Notification` table is justified.
- Read/unread is persisted per user or role.
- Authorization and retention are defined.
- Notification creation is idempotent.
- No destructive action runs directly from the dropdown.
