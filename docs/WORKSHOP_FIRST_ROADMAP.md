# RepairLab - Workshop-First Roadmap

## Purpose

This roadmap prioritizes RepairLab as an internal operating system for the user's own electronics/repair workshop.

The goal is not to build a SaaS product first. The goal is to make the workshop faster, clearer, more professional, more profitable, and better at turning real repair work into customer trust and marketing content.

Priority scale:

- P0: must do before relying on RepairLab for daily workshop operations.
- P1: high-value improvement for daily use.
- P2: useful after core workflow is stable.
- P3: future phase or optional.

## 1. Immediate Operational Stability

### 1.1 Run the full manual E2E checklist with real-like workshop data

- Priority: P0
- Why it matters for the workshop: Confirms the real repair workflow works from reception to delivery before relying on it during customer work.
- Affected users: owner, technician, reception/admin staff.
- Affected modules: intake, tickets, quotes, invoices, payments, inventory, portal, PDFs, messages, storage, backups.
- Implementation risk: Low. Documentation/testing task, not a feature.
- What not to overbuild: Do not automate E2E with Playwright yet unless repeated manual testing becomes a bottleneck.

### 1.2 Create a clean controlled workshop/demo environment

- Priority: P0
- Why it matters for the workshop: Avoids confusion between test data, demo data, and real repair data.
- Affected users: owner, staff.
- Affected modules: Docker, seed data, auth, database, storage.
- Implementation risk: Medium. Must avoid deleting or mixing real data.
- What not to overbuild: Do not create a full staging/CD system yet; start with a clear local/demo setup.

### 1.3 Strengthen backup discipline for real workshop use

- Priority: P0
- Why it matters for the workshop: Repair data, photos, payments, and customer history become business-critical once used daily.
- Affected users: owner.
- Affected modules: backups, PostgreSQL, private storage, docs.
- Implementation risk: Medium. Restore mistakes can be dangerous.
- What not to overbuild: Do not build a backup dashboard yet. First ensure repeatable backup, restore, and off-device copy.

### 1.4 Verify admin security before using real customer data

- Priority: P0
- Why it matters for the workshop: Customer data, device photos, payments, and portal links must be protected.
- Affected users: owner, staff, customers.
- Affected modules: auth, roles, admin routes, portal, file downloads, rate limiting.
- Implementation risk: Medium.
- What not to overbuild: Do not implement enterprise identity/OAuth. Tighten existing auth and route checks first.

### 1.5 Clean up operational docs for daily use

- Priority: P1
- Why it matters for the workshop: Makes it easier to run the system without remembering hidden commands or fragile steps.
- Affected users: owner.
- Affected modules: docs, Docker, backups, worker, manual E2E checklist.
- Implementation risk: Low.
- What not to overbuild: Do not write a giant manual. Keep short checklists for common operations.

## 2. Workshop Workflow Improvements

### 2.1 Make intake faster on mobile

- Priority: P0
- Why it matters for the workshop: Reception is where missing information starts. A fast intake reduces rework and customer confusion.
- Affected users: reception/admin staff, owner, technician.
- Affected modules: `/admin/intake`, customers, devices, tickets, private files.
- Implementation risk: Medium. Must not break ticket creation or file upload.
- What not to overbuild: Do not add too many fields. Only capture information that helps diagnosis, quote, delivery, warranty, or trust.

### 2.2 Improve ticket detail as the daily repair cockpit

- Priority: P0
- Why it matters for the workshop: The ticket page should answer what device this is, what is wrong, what is next, what is owed, and what has been communicated.
- Affected users: technician, owner, reception/admin staff.
- Affected modules: tickets, quotes, invoices, payments, messages, portal, files, timeline.
- Implementation risk: Medium.
- What not to overbuild: Do not turn it into a giant ERP page. Keep next action and status clarity first.

### 2.3 Add clearer warranty handling

- Priority: P1
- Why it matters for the workshop: Warranty misunderstandings can cost money and damage trust.
- Affected users: owner, technician, customers.
- Affected modules: tickets, customer communication, notes, messages, PDFs if warranty terms are shown.
- Implementation risk: Medium. Warranty rules can become legally sensitive.
- What not to overbuild: Do not create a legal warranty engine. Start with clear notes, linked ticket reference, and customer-facing wording.

### 2.4 Improve quote approval follow-up

- Priority: P1
- Why it matters for the workshop: Pending quotes block revenue and repair progress.
- Affected users: owner, reception/admin staff, customers.
- Affected modules: quotes, tickets, dashboard, messages, customer portal.
- Implementation risk: Low to medium.
- What not to overbuild: Do not implement public online approval yet unless the manual flow is painful. Start with better visibility and message templates.

### 2.5 Improve payment and balance visibility

- Priority: P1
- Why it matters for the workshop: Unclear balances create collection problems and delivery friction.
- Affected users: owner, reception/admin staff, customers.
- Affected modules: invoices, payments, dashboard, ticket detail, portal.
- Implementation risk: Medium because payment logic must remain correct.
- What not to overbuild: Do not add online payments or accounting integrations yet.

### 2.6 Add service profitability review

- Priority: P2
- Why it matters for the workshop: Helps decide which repairs are worth offering or promoting.
- Affected users: owner.
- Affected modules: catalog, invoices, payments, inventory, dashboard/reporting.
- Implementation risk: Medium. Profit requires reliable cost data.
- What not to overbuild: Do not build advanced analytics. Start with simple revenue, parts cost, time notes, and service category summaries.

## 3. Inventory and Spare Parts

### 3.1 Define which parts are worth tracking

- Priority: P0
- Why it matters for the workshop: Tracking every tiny item wastes time; tracking critical parts prevents delays and protects margin.
- Affected users: owner, technician.
- Affected modules: catalog, inventory, quotes, invoices.
- Implementation risk: Low.
- What not to overbuild: Do not model every consumable or rare part. Start with frequent, expensive, or delivery-critical parts.

### 3.2 Improve low-stock alerts for daily work

- Priority: P1
- Why it matters for the workshop: Prevents repair delays caused by missing common parts.
- Affected users: owner, technician.
- Affected modules: inventory, dashboard, catalog, notifications later.
- Implementation risk: Low to medium.
- What not to overbuild: Do not create a full procurement system. Start with clear low-stock visibility and manual restock decisions.

### 3.3 Track part usage by repair type

- Priority: P1
- Why it matters for the workshop: Helps plan purchases and understand real repair costs.
- Affected users: owner, technician.
- Affected modules: inventory, invoice items, catalog, reports.
- Implementation risk: Medium. Requires consistent line item usage.
- What not to overbuild: Do not require perfect categorization before it is useful.

### 3.4 Add supplier notes manually

- Priority: P2
- Why it matters for the workshop: Helps remember where to buy parts, quality issues, and expected cost.
- Affected users: owner.
- Affected modules: catalog, inventory.
- Implementation risk: Low.
- What not to overbuild: Do not build supplier accounts, purchase orders, or integrations yet.

### 3.5 Dead stock review

- Priority: P2
- Why it matters for the workshop: Reduces money trapped in parts that do not move.
- Affected users: owner.
- Affected modules: inventory, dashboard/reporting.
- Implementation risk: Medium because usage history may be incomplete.
- What not to overbuild: Do not build forecasting. Start with "not used recently" and manual review.

## 4. Customer Communication

### 4.1 Create reusable customer message templates

- Priority: P0
- Why it matters for the workshop: Professional messages save time and reduce mistakes.
- Affected users: reception/admin staff, owner, customers.
- Affected modules: messages, tickets, quotes, invoices, portal.
- Implementation risk: Low.
- What not to overbuild: Do not build a campaign system. Start with templates for received, diagnosis, quote ready, approved, ready for pickup, balance pending, delivered, warranty.

### 4.2 Improve portal link sharing workflow

- Priority: P1
- Why it matters for the workshop: The portal reduces repeated status questions and increases trust.
- Affected users: reception/admin staff, customers.
- Affected modules: ticket detail, customer portal, messages.
- Implementation risk: Low.
- What not to overbuild: Do not build customer accounts yet. Token link is enough.

### 4.3 Improve customer-facing status language

- Priority: P1
- Why it matters for the workshop: Customers should understand status without raw technical enum language.
- Affected users: customers, reception/admin staff.
- Affected modules: portal, ticket status labels, messages, PDFs.
- Implementation risk: Low.
- What not to overbuild: Do not create a complex localization system yet. Keep Spanish clear and consistent.

### 4.4 Add pickup and balance reminders as drafts

- Priority: P2
- Why it matters for the workshop: Helps collect money and clear completed devices.
- Affected users: reception/admin staff, owner, customers.
- Affected modules: tickets, invoices, payments, messages, notifications later.
- Implementation risk: Medium if automated; low if draft/manual.
- What not to overbuild: Do not auto-send reminders yet. Generate drafts first.

### 4.5 Warranty communication templates

- Priority: P2
- Why it matters for the workshop: Warranty communication needs clarity and consistency.
- Affected users: owner, technician, customers.
- Affected modules: tickets, messages, PDFs if terms are documented.
- Implementation risk: Medium due to customer expectations.
- What not to overbuild: Do not create legal warranty automation. Keep wording reviewed by the owner.

## 5. Marketing / Content Engine

### 5.1 Mark tickets as content opportunities manually

- Priority: P1
- Why it matters for the workshop: Captures good repair stories before they are forgotten.
- Affected users: owner, technician, content workflow.
- Affected modules: tickets, files/photos, content docs.
- Implementation risk: Medium if schema is required; low if initially documented/manual.
- What not to overbuild: Do not auto-generate or auto-publish. Start with manual flagging or notes.

### 5.2 Generate safe content drafts from completed repairs

- Priority: P1
- Why it matters for the workshop: Turns real work into local trust and service promotion.
- Affected users: owner, local marketing/content workflow.
- Affected modules: tickets, notes, files, content engine, customer privacy rules.
- Implementation risk: Medium due to privacy filtering.
- What not to overbuild: Do not use private data or publish automatically. Draft only.

### 5.3 Build service-specific content templates

- Priority: P1
- Why it matters for the workshop: Makes content repeatable for common profitable services.
- Affected users: owner, marketing/content workflow.
- Affected modules: catalog, content engine, service categories.
- Implementation risk: Low.
- What not to overbuild: Do not build a social media scheduler. Markdown/templates are enough initially.

### 5.4 Track which services generate inquiries

- Priority: P2
- Why it matters for the workshop: Helps decide what to promote and what to stop pushing.
- Affected users: owner.
- Affected modules: customers, tickets, marketing notes, dashboard/reporting later.
- Implementation risk: Medium because attribution can get messy.
- What not to overbuild: Do not build full CRM attribution. Start with simple source/service notes.

### 5.5 Create Google Business and social post draft workflow

- Priority: P2
- Why it matters for the workshop: Keeps local presence active without requiring heavy marketing tools.
- Affected users: owner.
- Affected modules: content engine, marketing docs, possibly ticket detail later.
- Implementation risk: Low to medium.
- What not to overbuild: Do not integrate APIs or auto-post. Draft, review, manual publish.

## 6. Future Optional Automation

### 6.1 Email through outbox worker

- Priority: P2
- Why it matters for the workshop: Makes communication more reliable and less tied to request timing.
- Affected users: owner, staff, customers.
- Affected modules: email, MessageLog, IntegrationEvent, worker.
- Implementation risk: Medium.
- What not to overbuild: Do not build a complex queue stack yet. Use the existing outbox first.

### 6.2 WhatsApp integration

- Priority: P3
- Why it matters for the workshop: WhatsApp is likely important for customer communication, but it is risky and should follow the stable manual workflow.
- Affected users: reception/admin staff, customers.
- Affected modules: messages, IntegrationEvent, customer contact preferences, templates.
- Implementation risk: High.
- What not to overbuild: Do not implement real WhatsApp before consent, templates, provider setup, logging, retry behavior, and privacy rules.

### 6.3 AI-assisted repair summaries and content drafts

- Priority: P3
- Why it matters for the workshop: Could save time summarizing repairs and drafting content, but must not make repair decisions.
- Affected users: owner, technician, content workflow.
- Affected modules: tickets, content engine, AI provider later.
- Implementation risk: High due to privacy and hallucination risk.
- What not to overbuild: Do not build AI diagnosis or automatic decisions. Draft-only, staff-reviewed.

### 6.4 Notifications center with derived alerts

- Priority: P2
- Why it matters for the workshop: Helps surface tickets waiting approval, low stock, unpaid balances, and pickup-ready devices.
- Affected users: owner, reception/admin staff, technician.
- Affected modules: dashboard, tickets, inventory, payments, messages.
- Implementation risk: Medium.
- What not to overbuild: Do not create a full notification database until derived alerts prove useful.

### 6.5 n8n automations

- Priority: P3
- Why it matters for the workshop: Could automate repetitive external tasks later.
- Affected users: owner.
- Affected modules: IntegrationEvent, webhooks, messages, content workflow.
- Implementation risk: High.
- What not to overbuild: Do not let n8n become the business source of truth. It should only consume events or call validated APIs.

## 7. Explicit Non-Goals

### 7.1 Multi-tenant SaaS

- Priority: Non-goal now
- Why it matters for the workshop: It does not help the current workshop operate better today.
- Affected users: future external shops only.
- Affected modules: auth, database, deployment, billing, support.
- Implementation risk: Very high.
- What not to overbuild: Do not design tenant isolation until the user explicitly enters SaaS commercialization.

### 7.2 Public subscription pricing and SaaS onboarding

- Priority: Non-goal now
- Why it matters for the workshop: Current focus is internal value, not selling software subscriptions.
- Affected users: future SaaS customers only.
- Affected modules: public site, billing, onboarding, auth.
- Implementation risk: High distraction.
- What not to overbuild: Do not build pricing pages, checkout, tenant onboarding, or trial flows.

### 7.3 Online payments

- Priority: Non-goal now
- Why it matters for the workshop: Manual payments are enough until the workflow and collection process are validated.
- Affected users: customers, owner.
- Affected modules: invoices, payments, portal, security.
- Implementation risk: High.
- What not to overbuild: Do not add payment providers before security, reconciliation, refunds, and operational need are clear.

### 7.4 Fiscal invoicing

- Priority: Non-goal now
- Why it matters for the workshop: Internal invoices support operations, but official fiscal invoicing adds legal and technical complexity.
- Affected users: owner, customers.
- Affected modules: invoices, tax/legal, PDFs, external providers.
- Implementation risk: Very high.
- What not to overbuild: Do not imply current invoices are fiscal/legal documents unless implemented and reviewed.

### 7.5 Automatic social publishing

- Priority: Non-goal now
- Why it matters for the workshop: Content can help growth, but automatic publishing risks privacy and brand mistakes.
- Affected users: owner, customers.
- Affected modules: content engine, files/photos, marketing channels.
- Implementation risk: High.
- What not to overbuild: Drafts only. Human approval is mandatory.

### 7.6 AI repair diagnosis or autonomous decisions

- Priority: Non-goal now
- Why it matters for the workshop: AI can assist, but repair decisions, price, warranty, approval, and delivery must remain human-controlled.
- Affected users: technician, owner, customers.
- Affected modules: tickets, AI, quotes, warranty.
- Implementation risk: Very high.
- What not to overbuild: Do not let AI approve repairs, set prices, guarantee outcomes, or communicate final decisions automatically.

## Recommended Next Focus

The next practical milestone should be:

1. Validate the full repair workflow with real-like data.
2. Improve intake and ticket detail for mobile workshop speed.
3. Make quote, invoice, balance, and portal communication clearer.
4. Define the first list of parts worth tracking.
5. Create draft templates for customer messages and repair content.
6. Defer WhatsApp, AI, multi-tenant, online payments, and fiscal invoicing until the internal workflow is consistently valuable.
