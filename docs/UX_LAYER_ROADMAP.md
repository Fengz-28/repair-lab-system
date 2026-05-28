# RepairLab UX Layer Roadmap

RepairLab already has a strong visual system: dark premium surfaces, motion, spatial UI, skeletons, empty states, and form feedback. The UX Layer is the next product milestone: it turns the admin from a set of polished pages into a fast operational console.

The goal is to help staff move through the system with less navigation friction, clearer context, and faster access to common actions.

## Scope

The UX Layer should be implemented incrementally. It should not replace existing routes, Server Actions, or domain services. It should sit above the current admin workflow and help users reach the right screen or action faster.

Initial modules:

- Command Palette
- Global Search
- Keyboard Shortcuts
- Quick Actions
- Activity Timeline
- Notifications Center

## Recommended Order

### Phase 1 - Foundation

Status: completed.

Deliverables:

- Static command palette for admin routes.
- `Ctrl+K` / `Cmd+K` keyboard shortcut.
- Small visual hint in the admin shell.
- Roadmap and module boundaries documented.

Database required: no.

Acceptance:

- Staff can open the palette from any admin page.
- Palette only lists safe existing routes.
- Escape closes the overlay.
- Disabled future actions do not trigger navigation.
- No business logic changes.

### Phase 2 - Global Search

Status: completed for v1.

Deliverables:

- Server-side admin-only search action in `src/modules/ux/search/global-search.ts`.
- Search targets:
  - tickets by code/title/problem
  - customers by name/contact/email/phone
  - devices by brand/model/serial
  - messages by recipient/subject/body/status/ticket/customer
  - invoices/quotes by number (future v2)
- Result groups with clear labels and destination routes.
- Query minimum: 2 characters.
- Result limits: 5 per category, 15 total.
- Client debounce: 250ms.

Database required: yes, read-only queries. No schema change required at first.

Implemented v1 behavior:

- Results are only available inside the admin command palette.
- The search calls `requireLocalStaff()` before querying.
- Results navigate to existing admin routes:
  - `/admin/tickets/[ticketId]`
  - `/admin/customers/[customerId]`
  - `/admin/messages/[messageId]`
- No internal notes, private files, audit logs, credentials, or message metadata are returned.

Possible future schema:

- Optional search index table if query performance becomes a problem.
- Optional trigram indexes in PostgreSQL.

Risks:

- Slow wildcard queries on growing tables.
- Accidental exposure of internal-only data in public UI.
- Overloading command palette with too many results.

Acceptance:

- Query returns grouped results under 300ms on demo data.
- No raw IDs displayed unless meaningful.
- No private notes or sensitive metadata shown.

### Phase 3 - Quick Actions

Status: completed for v1.

Deliverables:

- Context-aware actions for current page.
- Safe actions first:
  - open intake
  - open ticket
  - open customer
  - open invoice
  - download available PDF
- Mutating actions only after explicit confirmation.

Database required: mostly no for navigation actions; yes if context-aware actions need data.

Implemented v1 behavior:

- Quick actions live in `src/modules/ux/lib/quick-actions.ts`.
- They are shown inside the admin Command Palette as navigation-only actions.
- Base actions open dashboard, tickets, customers, messages, catalog, and intake.
- Contextual ticket actions are derived from the current pathname:
  - `/admin/tickets/[ticketId]` and subroutes can open current ticket quotes.
  - quote and invoice subroutes can go back to ticket detail.
  - invoice actions only appear when the current route already contains a safe invoice id.
- No mutations, deletes, status changes, invoice creation, quote sending, or payment actions are exposed.

Quick Actions v2:

- Add mutating actions only after confirmation UI.
- Reuse existing Server Actions and authorization checks.
- Add role-aware visibility.
- Add PDF download actions when current route context has enough ids.

Risks:

- Accidentally bypassing existing validations.
- Surfacing actions the user's role should not access.

Acceptance:

- Quick actions reuse existing routes/actions.
- Mutating actions require the same authorization as the original screen.
- Disabled actions explain why they are disabled.

### Phase 4 - Keyboard Shortcuts

Deliverables:

- Shortcut registry.
- Help panel or command palette section.
- Safe shortcuts:
  - `Ctrl/Cmd+K`: command palette
  - `/`: focus search where appropriate
  - `g d`: dashboard
  - `g t`: tickets

Database required: no.

Risks:

- Conflicting with browser shortcuts.
- Triggering shortcuts while typing in forms.

Acceptance:

- Shortcuts are ignored when typing in inputs/textareas/selects.
- Focus remains visible and recoverable.
- Shortcuts are documented in UI.

### Phase 5 - Activity Timeline

Deliverables:

- Unified operational activity stream.
- Reuse existing `TicketEvent`, `MessageLog`, payments, invoices, and inventory movements where possible.
- Show activity in:
  - dashboard
  - ticket detail
  - customer detail

Database required: initially no, if composed from existing tables. Future schema may help.

Possible future schema:

- `ActivityEvent` table with:
  - id
  - type
  - severity
  - actorId
  - ticketId/customerId/invoiceId optional
  - title
  - description
  - metadata
  - createdAt

Risks:

- Duplicating existing audit/event concepts.
- Showing internal details to the wrong audience.

Acceptance:

- Timeline is human-readable.
- It avoids raw enums.
- It distinguishes customer-safe vs internal-only events.

### Phase 6 - Notifications Center

Deliverables:

- Internal notification list for staff.
- Initial event types:
  - low stock
  - failed email
  - pending quote approval
  - overdue tickets
  - invoice balance pending
- Severity:
  - info
  - warning
  - urgent
  - success

Database required: yes if notifications must be persisted/read/unread.

Possible future schema:

- `Notification` table with status, severity, readAt, and reference fields.

Risks:

- Notification noise.
- Duplicating dashboard lists.
- Needing role-based filtering.

Acceptance:

- Notifications are actionable.
- No alert fatigue.
- Each notification links to the relevant screen.

## Technical Boundaries

`src/modules/ux/` owns:

- command definitions
- command palette components
- UX hooks
- future global search service
- future shortcut registry

It should not own:

- ticket lifecycle rules
- payment logic
- inventory calculations
- auth/session implementation
- Prisma schema changes without a dedicated milestone

## Dependency Policy

No dependency is required for Phase 1. Use React state, Next navigation, and existing Tailwind/CSS motion.

Potential future dependencies:

- `cmdk`: useful if the command palette becomes complex with grouped keyboard navigation.
- `@tanstack/react-virtual`: useful only if search results become very large.

Do not add either until the native implementation becomes a real maintenance cost.

## Accessibility Rules

- Dialog must use `role="dialog"` and `aria-modal`.
- Escape must close the palette.
- Overlay click may close the palette.
- Input must have an accessible label.
- Disabled actions must be visible but non-interactive.
- Focus states must remain visible.

## Production Considerations

- Global search must respect staff auth and roles.
- Public portal must not use admin search.
- Search results must not expose internal notes, audit logs, secrets, or private files.
- Keyboard shortcuts must not trigger inside form fields.
- Mutating quick actions must call existing validated actions.

## Milestone Exit Criteria

The UX Layer foundation is acceptable when:

- The command palette opens consistently in admin.
- It navigates to existing routes only.
- It is mobile usable.
- It does not appear in public pages.
- Lint, TypeScript, and tests pass.
