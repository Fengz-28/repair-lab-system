# Receipts

Placeholder foundation for reception receipts.

Current behavior:

- renders text/html preview,
- creates an `Invoice` with `type = RECEIPT`,
- creates a zero-value `InvoiceItem`,
- creates `IntegrationEvent` and `AuditLog`,
- does not generate PDF,
- does not process payments.

