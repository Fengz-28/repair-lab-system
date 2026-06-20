# Email Notifications

Actualizado: 2026-06-19, America/Costa_Rica.

## Decision

Email is the initial official notification channel for FengzLab customer-visible ticket updates.

WhatsApp is deferred until FengzLab has a dedicated WhatsApp Business number. Do not use the owner's personal WhatsApp as the default public channel. Do not add WhatsApp API, n8n, marketing automation, checkout, cart, or payment gateway work as part of this email phase.

## Scope

These emails are transactional, not marketing.

Allowed purpose:

- tell the customer that a ticket was received or updated;
- tell the customer that a quote is available;
- tell the customer that a repair is ready for pickup or delivered;
- link the customer back to the portal when a safe portal URL exists.

Not allowed:

- promotional campaigns;
- automated upsells;
- abandoned cart flows;
- AI-generated marketing blasts;
- sending internal technical notes to customers.

## Provider strategy

Preferred first provider: Resend.

The system must support safe modes before live sending:

```env
EMAIL_PROVIDER=resend
EMAIL_NOTIFICATIONS_ENABLED=false
EMAIL_DRY_RUN=true
```

Rules:

- `EMAIL_NOTIFICATIONS_ENABLED=false` disables external sending.
- `EMAIL_DRY_RUN=true` stores/logs intended messages without sending externally.
- Live sending requires both an enabled notification flag and dry-run disabled.
- Real provider secrets must live only in local/server `.env` files, never in Git.

## Required placeholders

Expected configuration names:

```env
EMAIL_PROVIDER=resend
EMAIL_NOTIFICATIONS_ENABLED=false
EMAIL_DRY_RUN=true
EMAIL_FROM="FengzLab <updates@example.com>"
EMAIL_REPLY_TO=contacto@example.com
RESEND_API_KEY=replace-with-resend-api-key
PUBLIC_CONTACT_EMAIL=contacto@example.com
NEXT_PUBLIC_CONTACT_EMAIL=contacto@example.com
NEXT_PUBLIC_WHATSAPP_ENABLED=false
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Replace example addresses before live sending.

## Customer data safety

Emails must not include:

- internal notes;
- staff-only comments;
- private file paths;
- private photos or attachments;
- audit logs;
- stack traces;
- secrets;
- raw provider errors;
- sensitive technical details not meant for customers.

Emails should include:

- ticket number;
- safe device label;
- safe customer-facing status;
- portal link when available;
- quote or invoice link only when the token route is safe for the customer.

## Reply-to

`EMAIL_REPLY_TO` should point to the human inbox used by FengzLab for customer communication.

Customers should be able to reply to a real monitored inbox. Do not use a no-reply address unless a separate contact path is clearly shown.

## DNS/provider setup before live sending

Before changing to live sending:

- verify the sending domain with Resend or chosen provider;
- configure SPF;
- configure DKIM;
- configure DMARC if available;
- test delivery to the owner inbox first;
- confirm no internal data appears in the message;
- keep screenshots/logs free of secrets and customer private data.

## Rollback

If email sending behaves unexpectedly:

```env
EMAIL_NOTIFICATIONS_ENABLED=false
EMAIL_DRY_RUN=true
```

The customer portal and manual communication remain the fallback path.

## Current implementation note

The existing system has `MessageLog` and `IntegrationEvent` tables. The safe target architecture is to queue customer-visible email work and process it manually through the outbox/worker, instead of sending provider calls inline during ticket mutations.
