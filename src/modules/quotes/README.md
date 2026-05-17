# Quotes foundation

Quotes use `Invoice` with `type = QUOTE` as the source of truth.

Current scope:

- create quotes for tickets,
- add service/product/part lines,
- calculate subtotal and total,
- status transitions: `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `EXPIRED`,
- approval token placeholder,
- ticket events,
- audit logs,
- integration events,
- notification draft when quote is sent.

No payments, PDF generation, customer auth, fiscal invoicing or real email delivery.

