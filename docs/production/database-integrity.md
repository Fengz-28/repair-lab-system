# Section F - Database Integrity

Status: audited. No schema migration applied in this section.

## Current database posture

PostgreSQL is the source of truth. Prisma is the application data access layer.

The current Prisma client uses `@prisma/adapter-pg` with `DATABASE_URL`. The app keeps a shared client in development and creates a normal client in production.

## Critical models

Production-critical workshop models:

- `User`
- `Customer`
- `Device`
- `Intake`
- `Ticket`
- `TicketStatusHistory`
- `TicketComment`
- `TicketEvent`
- `CatalogItem`
- `InventoryItem`
- `InventoryMovement`
- `Invoice`
- `InvoiceItem`
- `Payment`
- `MessageLog`
- `FileAsset`
- `IntegrationEvent`
- `AuditLog`

Future or secondary models:

- `Appointment`
- `WebhookEndpoint`
- `KnowledgeDocument`
- `KnowledgeChunk`
- `AIInteraction`

## Existing protections

Important uniqueness constraints:

- `User.email`
- `Intake.receiptNumber`
- `Ticket.ticketNumber`
- `Ticket.intakeId`
- `Ticket.publicAccessToken`
- `CatalogItem.sku`
- `InventoryItem.catalogItemId`
- `Invoice.invoiceNumber`
- `Invoice.approvalToken`
- `IntegrationEvent.idempotencyKey`

Important indexes already present:

- `Customer.email`
- `Customer.phone`
- `Customer.whatsappPhone`
- `Device.customerId`
- `Device.serial`
- `Device.brand, Device.model`
- `Intake.customerId`
- `Intake.deviceId`
- `Intake.createdAt`
- `Ticket.customerId`
- `Ticket.deviceId`
- `Ticket.status`
- `Ticket.createdAt`
- `TicketStatusHistory.ticketId, createdAt`
- `TicketComment.ticketId, createdAt`
- `TicketEvent.ticketId, createdAt`
- `CatalogItem.type`
- `CatalogItem.category`
- `CatalogItem.isActive`
- `InventoryMovement.inventoryItemId, createdAt`
- `InventoryMovement.referenceType, referenceId`
- `Invoice.customerId`
- `Invoice.ticketId`
- `Invoice.status`
- `InvoiceItem.invoiceId`
- `Payment.invoiceId`
- `Payment.method`
- `Payment.createdAt`
- `MessageLog.customerId`
- `MessageLog.ticketId`
- `MessageLog.channel, status`
- `MessageLog.providerMessageId`
- `FileAsset.ownerType, ownerId`
- `FileAsset.intakeId`
- `FileAsset.ticketId`
- `IntegrationEvent.type, status`
- `IntegrationEvent.aggregateType, aggregateId`
- `IntegrationEvent.availableAt`
- `AuditLog.actorUserId`
- `AuditLog.entityType, entityId`
- `AuditLog.createdAt`

## Relations and delete behavior

The schema primarily uses Prisma's default required/optional relation behavior. This avoids accidental broad cascade deletion in the reviewed critical workflow.

Current production implication:

- Deleting core records should remain rare or disabled at the application layer.
- If delete features are introduced later, each relation needs an explicit retention policy first.
- Historical models such as status history, ticket events, audit logs, payments, invoices, and file metadata should be treated as append-mostly.

## Token integrity

Token and document identifiers checked:

- Customer portal access uses `Ticket.publicAccessToken`, which is unique.
- Quote/invoice PDF access from the public portal is resolved through the ticket public token and visible quote/invoice state.
- `Invoice.approvalToken` is unique when present, but public approval flows are not the primary active path in the current implementation.
- Invoice numbers and ticket numbers are unique.

## Traceability

Traceability is strong for the current workshop workflow:

- Ticket status changes are preserved in `TicketStatusHistory`.
- Timeline events are preserved in `TicketEvent`.
- Business mutations write `AuditLog` in the reviewed domain services.
- Integration/outbox events are stored in `IntegrationEvent`.
- File metadata is stored in `FileAsset` while binary content remains in private storage.

## Quote, invoice, and payment consistency risks

Existing protections:

- Quotes and invoices share the `Invoice` model with `InvoiceType`.
- Invoice and quote numbers are unique.
- Payments are linked to invoices.
- Payment services recalculate totals and update payment state.
- Quote-to-invoice conversion checks for existing invoice records for a quote path.

Deferred risks:

- Some quote/invoice invariants are enforced in service code rather than database constraints.
- There is no database-level constraint preventing invalid status/type combinations.
- Payment totals depend on service logic; database constraints do not enforce "paid total cannot exceed invoice total".
- Concurrent payment registration should be reviewed with transaction isolation and locking in a later pass if real payment volume grows.

## Inventory consistency risks

Existing protections:

- `InventoryItem.catalogItemId` is unique.
- Movements are linked to inventory items.
- Inventory movement history is preserved.
- Payment and catalog services create inventory movements for stock changes.

Deferred risks:

- Stock cannot go below zero is service-enforced, not database-enforced.
- Concurrent inventory adjustments can still require stricter transaction strategy if multiple staff update the same item at once.
- Low-stock and reorder calculations are operational logic, not database constraints.

## IntegrationEvent / outbox risks

Existing protections:

- `IntegrationEvent.idempotencyKey` is unique when present.
- Events track `status`, `attempts`, `availableAt`, `processedAt`, `lastError`, `createdAt`, and `updatedAt`.
- Worker claims events with conditional `updateMany`, which reduces double-processing risk.
- Stale `PROCESSING` events can be retried by time threshold.

Deferred risks:

- Worker is a run-once script, not a supervised long-running process.
- No `lockedBy` field exists.
- No database advisory lock is used.
- Indexing for the worker candidate query can be improved later with a composite index.

## Index recommendations

No indexes were added in Section F because this would require a migration decision. Recommended non-destructive candidates for a later F2 index migration:

- `Invoice(type, status, createdAt)` for dashboard quote/invoice queues.
- `Invoice(type, paymentStatus, createdAt)` for payment/debt queues.
- `Invoice(createdAt)` if dashboard month/today counts grow.
- `Ticket(updatedAt)` for global search ordering.
- `TicketEvent(createdAt)` for recent activity dashboard.
- `InventoryMovement(createdAt)` for recent inventory activity dashboard.
- `IntegrationEvent(status, availableAt, createdAt)` for worker candidate selection.
- `MessageLog(status, createdAt)` for notification center queues.
- `CatalogItem(type, name)` for catalog admin ordering.

These are safe candidates, but they should be applied in a dedicated migration after confirming current data size and query plans.

## Migration recommendations

Recommended next migration pass, if approved separately:

1. Add the composite/index candidates above in a single non-destructive migration.
2. Run `npx prisma migrate dev --name production_indexes` locally.
3. Review generated SQL before applying anywhere exposed.
4. Validate with `npx prisma validate`, `npx prisma generate`, lint, typecheck, and a small admin smoke test.

## Destructive risks avoided

Section F did not:

- drop columns;
- rename models;
- alter relation ownership;
- introduce multi-tenant fields;
- change delete behavior;
- rewrite workflow schema;
- run destructive migrations.

## Deferred risks

- No restore drill was run in this section.
- No migration status check against a live database was run.
- No query plan analysis was run.
- Some invariants remain enforced in services rather than database constraints.
- Production backup/restore and external monitoring remain separate sections.
