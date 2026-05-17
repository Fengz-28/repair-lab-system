# Notifications

Placeholder foundation for future email, WhatsApp and automation notifications.

Current behavior:

- renders reusable email subject/text/html previews,
- stores an outbound `MessageLog` with `status = DRAFT`,
- creates an `IntegrationEvent` for future workers/n8n,
- does not send SMTP,
- does not expose private files or photo URLs.

