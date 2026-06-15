# Section D - CSRF and Rate Limiting

Status: partially hardened with a small VPS-compatible CSRF guard.

## Scope reviewed

Reviewed surfaces:

- Login server action.
- Logout `POST` route.
- Admin server actions for intake, tickets, quotes, invoices/payments, catalog, and inventory.
- Public customer portal token page.
- Public quote/invoice PDF token routes.
- Healthcheck route.
- Existing rate limit utilities.

No `PUT`, `PATCH`, or `DELETE` route handlers were found in the reviewed application surface.

## CSRF control

Added `src/server/security/csrf.ts`.

The control checks the request `Origin` header against:

- the current request origin from `Host` / `X-Forwarded-Host`;
- `APP_URL`;
- `PUBLIC_SITE_URL`;
- `NEXT_PUBLIC_APP_URL`.

If an `Origin` header is present and does not match an allowed origin, the request is rejected.

This was applied to:

- `src/app/login/actions.ts`
- `src/app/logout/route.ts`
- `src/app/admin/intake/actions.ts`
- `src/app/admin/catalog/actions.ts`
- `src/app/admin/tickets/[ticketId]/actions.ts`
- `src/app/admin/tickets/[ticketId]/quotes/actions.ts`
- `src/app/admin/tickets/[ticketId]/invoices/[invoiceId]/actions.ts`

This is intentionally not a full synchronizer-token CSRF system. It is a small production hardening step that works with the current local auth model and does not require a new dependency or UI changes.

## Rate limiting

Existing rate limit coverage:

- Login attempts use `loginRateLimitConfig()`.
- Customer portal token page uses `publicRateLimitConfig()`.
- Public quote PDF by token uses `publicRateLimitConfig()`.
- Public invoice PDF by token uses `publicRateLimitConfig()`.

The current rate limiter is in-memory through a process-global map. This is acceptable for local development and a single-process demo, but it is not enough for multi-process production or multiple app instances.

## Public routes

Intentionally public routes:

- `/`
- `/services`
- `/products`
- `/contact`
- `/login`
- `/api/health`
- `/track/[token]`
- `/track/[token]/quote.pdf`
- `/track/[token]/invoice.pdf`

Public token routes are bearer-link routes. They should remain rate-limited and should not expose internal notes, private files, staff-only records, admin links, or internal message metadata.

## Sensitive mutations protected

Sensitive mutations now have both:

- staff authorization through `requireLocalStaff()` where applicable;
- same-origin request validation through `requireSameOriginRequest()`.

Covered mutation groups:

- staff login;
- staff logout;
- intake creation and private upload intake;
- ticket status changes;
- internal comments;
- technical notes;
- private ticket attachments;
- quote creation and updates;
- quote-to-invoice conversion;
- manual payment registration;
- catalog item creation/status updates;
- inventory tracking and inventory adjustment.

## Gaps deferred

Deferred intentionally:

- Move rate limiting from in-memory to a shared production store.
- Decide whether to add explicit CSRF tokens for high-risk admin forms.
- Add route-level rate limiting for future public intake/contact forms if they become mutating endpoints.
- Add webhook signature validation when real webhooks are introduced.
- Define public portal token expiration, rotation, and revocation policy.

## Production notes

- Set `APP_URL`, `PUBLIC_SITE_URL`, and `NEXT_PUBLIC_APP_URL` to the real public origin before exposing production.
- Ensure reverse proxy forwards `Host`, `X-Forwarded-Host`, and `X-Forwarded-Proto` consistently.
- Keep `RATE_LIMIT_ENABLED=true` in exposed environments.
- Do not rely on in-memory rate limiting for horizontally scaled deployment.
