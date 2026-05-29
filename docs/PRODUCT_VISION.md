# RepairLab - Product Vision

## Purpose of this document

This document defines the product direction for RepairLab after its strategic repositioning.

RepairLab is first an internal workshop operating system for managing the user's own electronics/repair workshop.

It may later become a commercial SaaS product, but that is a future optional path, not the current primary goal.

## What RepairLab is

RepairLab is an internal workshop operating system for managing repairs, customers, devices, quotes, invoices, payments, inventory, communication, and workshop growth.

It exists to help the workshop operate faster, more professionally, and more profitably.

RepairLab should help replace scattered operational habits such as:

- WhatsApp chats as the only repair history.
- Notes in paper notebooks.
- Excel sheets without workflow.
- Photos lost in phone galleries.
- Unclear quote approval.
- Unclear payment balances.
- Parts used without stock traceability.
- Customers repeatedly asking for status.
- Completed repairs not being reused as content or proof of expertise.

## Primary mission

RepairLab's primary mission is to run the workshop better.

It should help the user:

- Receive devices faster.
- Record customer and device information clearly.
- Diagnose and track repairs.
- Avoid losing information.
- Manage parts and stock.
- Create quotes and invoices.
- Register manual payments and balances.
- Communicate professionally with customers.
- Generate trust through portal links, PDFs, and clear status history.
- Understand which services are profitable.
- Turn completed repairs into marketing/content opportunities.

## Secondary mission

RepairLab should support the workshop's marketing and customer acquisition.

It should help generate drafts for:

- Instagram posts.
- Facebook posts.
- TikTok scripts.
- Google Business updates.
- Before/after captions.
- Educational repair tips.
- Blog ideas.
- Service explanations.
- Customer communication templates.

This content must be draft-first and human-approved. RepairLab should never publish automatically unless a future workflow explicitly allows it with safeguards.

## Future optional mission

If RepairLab proves valuable in daily internal workshop use, it may later become a commercial SaaS.

That future path should remain possible, but it should not drive current priorities ahead of workshop usefulness.

Do not prioritize:

- Public pricing.
- Subscription packaging.
- Multi-tenant architecture.
- SaaS onboarding funnels.
- Investor-style metrics.
- Generic startup growth features.

unless the user explicitly asks to enter a SaaS commercialization phase.

## Target users now

Primary users:

- Workshop owner.
- Technician.
- Reception/admin staff.
- The same person doing multiple roles in a small shop.

Customer-facing user:

- Repair customer checking status through `/track/[token]`.

Future users if commercialized:

- Other repair shop owners and staff.

## Product experience

RepairLab should feel:

- Fast during real workshop work.
- Simple enough for non-technical use.
- Mobile-first.
- Professional.
- Dark premium and technical, but not decorative.
- Clear under pressure.
- Useful before it is impressive.

The best RepairLab screen is not the prettiest screen. It is the one that helps the workshop finish the next step with less friction.

## Core workshop workflows

### Intake

The system must make it fast to receive a device, capture condition, problem, accessories, customer data, and photos.

### Diagnosis

The system must help record what was found, what needs approval, and what action comes next.

### Quote

The system must make repair cost, parts, service lines, status, and approval clear.

### Repair

The system must make status and technical progress visible to staff.

### Invoice and payment

The system must make totals, paid amount, balance, and payment history obvious.

### Inventory

The system must help control parts without becoming a complex warehouse system.

### Delivery and warranty

The system should preserve delivery state, customer communication, and any warranty-related context.

### Customer portal

The portal should build trust by showing safe, clear, customer-facing repair status.

### Marketing/content support

Completed repairs should become possible content drafts, educational posts, and service proof, without exposing private customer data.

## Central functionality

Core functionality:

- Admin authentication and roles.
- Intake / reception.
- Customer and device records.
- Repair tickets and lifecycle.
- Ticket detail as operational center.
- Quotes.
- Internal invoices.
- Manual payments and balances.
- Customer portal by secure token.
- Public quote/invoice PDFs.
- Private file storage for reception photos and attachments.
- Dashboard for active work, money, and stock signals.
- Basic catalog/inventory.
- Message and email history.
- Manual E2E validation.
- Backups and health checks.

Workshop-growth functionality:

- Content draft generation from repair cases.
- Local marketing planning.
- Customer communication templates.
- Service profitability review.
- Campaign ideas based on real repair services.

## Secondary functionality

Useful later, but not current priority:

- WhatsApp integration.
- n8n automations.
- AI/RAG assistant.
- Google Calendar.
- Online payments.
- Fiscal invoicing.
- Ecommerce.
- Customer login accounts.
- Advanced analytics.
- Multi-location management.
- Full multi-tenant SaaS operations.
- Advanced supplier/procurement workflows.

## What RepairLab should not become right now

RepairLab should not become:

- A giant ERP.
- A SaaS product built before the workshop workflow is proven.
- A complex CRM.
- A corporate management system with too many menus.
- An AI automation playground.
- A marketing tool that publishes without review.
- A system that is hard to use on mobile.
- A product that requires perfect data entry to be useful.
- A visually impressive dashboard that does not help repair work.

## Product decisions to avoid

Avoid:

- Building SaaS-only features before internal validation.
- Building multi-tenant prematurely.
- Adding integrations without operational need and safety.
- Adding AI features that do not improve repair speed, revenue, or customer trust.
- Publishing marketing content automatically.
- Exposing customer data, serial numbers, private notes, or photos in content.
- Adding reports that do not help make workshop decisions.
- Making inventory more complex than the workshop needs.

## Development principles

1. Workshop usefulness first.
2. Mobile-first always.
3. Customer data privacy is non-negotiable.
4. Repair history must remain trustworthy.
5. Communication should be professional and clear.
6. Content generation must be draft-first.
7. Integrations should support workflow, not replace the source of truth.
8. SaaS architecture is future optional, not current driver.

## How agents should use this document

All agents should treat this document as the north star.

- Workshop CEO Agent: prioritize profitability, time savings, and service focus.
- Workshop Operations Agent: improve the real repair workflow.
- Inventory Agent: keep parts useful, controlled, and not overcomplicated.
- Frontend Developer Agent: optimize for speed, clarity, and mobile workshop use.
- Backend Architect Agent: protect data integrity, backups, audit, and operational reliability.
- UI/UX Designer Agent: keep screens professional, fast, and trust-building.
- Local Marketing Agent: promote real repair services, not SaaS growth.
- Content Agent: create safe drafts from real repair cases.
- Customer Relations Agent: communicate professionally without overpromising.
- Reality Checker Agent: block SaaS creep and low-value automation.
- QA Agent: validate real workshop workflows.
- Security Agent: protect customer data, private files, portal tokens, and communication logs.

If an agent recommendation does not clearly help the workshop, it should be reduced, deferred, or rejected.
