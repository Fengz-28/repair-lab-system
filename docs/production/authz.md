# Section C - Auth and Authorization

Status: audited with one minimal hardening fix.

## Current auth mechanism

FengzLab currently uses local staff authentication:

- Staff login validates email/password against the local `User` table.
- Sessions are signed with `AUTH_SECRET` and stored in an HTTP-only cookie.
- Session TTL is 8 hours.
- Production rejects the local development fallback when `AUTH_SECRET` is missing or unsafe.
- Inactive users are rejected when the session is resolved.

The middleware redirects unauthenticated `/admin/*` requests to `/login`, but middleware is only a fast redirect layer. The real authorization boundary should remain server-side `requireLocalStaff()` checks inside admin pages, route handlers, and sensitive server actions.

## Protected internal routes

Protected admin surfaces verified in this pass:

- `/admin`
- `/admin/dashboard`
- `/admin/intake`
- `/admin/tickets`
- `/admin/tickets/[ticketId]`
- `/admin/tickets/[ticketId]/quotes`
- `/admin/tickets/[ticketId]/quotes/[quoteId]/pdf`
- `/admin/tickets/[ticketId]/invoices/[invoiceId]`
- `/admin/tickets/[ticketId]/invoices/[invoiceId]/pdf`
- `/admin/customers`
- `/admin/customers/[customerId]`
- `/admin/messages`
- `/admin/messages/[messageId]`
- `/admin/catalog`
- `/admin/files/[fileAssetId]`

`/admin/intake` was hardened in this section to call `requireLocalStaff()` before querying recent intake records.

## Public routes

Intentionally public routes:

- `/`
- `/services`
- `/products`
- `/contact`
- `/login`
- `/logout`
- `/api/health`

`/api/health` exposes only component status (`database`, `storage`, timestamp) and does not expose secrets or business records.

## Token-based public routes

Token-based customer portal routes:

- `/track/[token]`
- `/track/[token]/quote.pdf`
- `/track/[token]/invoice.pdf`

These routes use `publicAccessToken` to locate the ticket. They expose customer-facing repair status, device label/serial, reported issue, public timeline labels, sent/approved quote details, invoice summary, and payment totals.

They should not expose internal notes, private file assets, staff-only records, admin links, or internal message metadata. The public portal and public PDF routes apply the public rate limiter.

## Sensitive mutations checked

Sensitive surfaces reviewed by guard summary:

- Intake creation and private uploads.
- Ticket status changes, comments, and technical actions.
- Quote creation, update, send, approval, rejection, and expiration actions.
- Invoice payment registration.
- Catalog and inventory mutations.
- Global admin search.
- Private file downloads.
- Admin quote/invoice PDF generation.

These mutation surfaces call `requireLocalStaff()`. Role-restricted actions use narrower roles where present, such as admin-only catalog/payment changes and technician/admin ticket work.

## Gaps fixed

- Added a server-side `requireLocalStaff()` guard to `src/app/admin/intake/page.tsx`.

## Gaps deferred

These should not be fixed in Section C without a broader auth/security pass:

- Middleware only checks for session cookie presence. This is acceptable as a fast redirect layer, but server-side guards must remain the real authorization boundary.
- Rate limiting is in-memory and should move to a shared production store in a later section.
- Public customer portal tokens are bearer-style links. A later pass should define token rotation, expiration policy, and a customer-facing revocation flow.
- CSRF posture for server actions should be reviewed separately. Current same-site cookies reduce exposure, but this section did not introduce a full CSRF framework.
- Audit logging coverage should be reviewed in a dedicated audit/events section.

## Production checklist

- Keep `AUTH_SECRET` strong and unique in production.
- Keep `SESSION_COOKIE_NAME` stable per deployment.
- Keep all admin data reads behind server-side `requireLocalStaff()`.
- Keep private uploads behind `/admin/files/[fileAssetId]`.
- Do not expose staff notes, private file assets, or internal message metadata through token routes.
