# RepairLab - Execution Plan Q3

## Purpose

This plan converts the workshop-first strategy into execution.

Scope is limited to tasks that produce direct value for the user's own repair workshop. It does not include SaaS features, multi-tenant work, public subscription pricing, or speculative automation.

## Phase 1 - Next 2 Weeks

### 1. Run full manual E2E workflow with real-like workshop data

- Priority: P0
- Estimated complexity: Low
- Estimated development effort: 0.5-1 day
- Dependencies: Docker app running, seeded/admin user, `docs/MANUAL_E2E_CHECKLIST.md`, local database and storage.
- Expected workshop impact: Confirms RepairLab can support the full daily repair workflow before real customer use.
- Expected customer impact: Reduces risk of broken portal, PDFs, quote, invoice, or payment experience.
- Expected marketing impact: Creates confidence to record real repair cases later.

### 2. Create a clean demo/workshop data set

- Priority: P0
- Estimated complexity: Medium
- Estimated development effort: 1-2 days
- Dependencies: seed admin flow, current Prisma schema, Docker/PostgreSQL, private storage.
- Expected workshop impact: Separates testing/demo data from future real repair records.
- Expected customer impact: Prevents accidental exposure of test or incorrect data.
- Expected marketing impact: Enables clean screenshots, demos, and content planning without exposing real customers.

### 3. Verify admin security and private file access before real use

- Priority: P0
- Estimated complexity: Medium
- Estimated development effort: 1-2 days
- Dependencies: auth helpers, `/admin/files/[fileAssetId]`, portal routes, rate limiting.
- Expected workshop impact: Protects customer data, repair photos, payment history, and internal notes.
- Expected customer impact: Increases trust that private repair data is not exposed.
- Expected marketing impact: Allows future content workflows to safely distinguish private vs approved material.

### 4. Improve mobile intake speed and clarity

- Priority: P0
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: current `/admin/intake`, private upload flow, customer/device/ticket creation.
- Expected workshop impact: Faster reception, fewer missing details, less rework during diagnosis.
- Expected customer impact: More professional reception and better repair documentation.
- Expected marketing impact: Better intake data creates better future content/source material.

### 5. Improve ticket detail "next action" clarity

- Priority: P0
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: ticket detail page, lifecycle states, quote/invoice/payment relationships, portal link, messages.
- Expected workshop impact: Technician and owner can immediately see what is next, what is owed, and what was communicated.
- Expected customer impact: Faster answers and fewer status mistakes.
- Expected marketing impact: Better repair summaries for future content drafts.

### 6. Create reusable customer message templates as drafts

- Priority: P0
- Estimated complexity: Low
- Estimated development effort: 1-2 days
- Dependencies: current message/email module, ticket/quote/invoice states, portal link.
- Expected workshop impact: Saves time and makes communication more consistent.
- Expected customer impact: Clearer repair status, quote, pickup, balance, and delivery messages.
- Expected marketing impact: Establishes tone and language that can later support public content.

### 7. Define the first tracked parts list

- Priority: P0
- Estimated complexity: Low
- Estimated development effort: 0.5-1 day
- Dependencies: current catalog/inventory module, real service priorities.
- Expected workshop impact: Focuses stock tracking on parts that affect repairs and margins.
- Expected customer impact: Fewer delays from missing common parts.
- Expected marketing impact: Helps identify services that can be promoted because parts are available.

## Phase 2 - Next Month

### 8. Improve quote approval follow-up visibility

- Priority: P1
- Estimated complexity: Medium
- Estimated development effort: 2-3 days
- Dependencies: quote states, ticket dashboard/list, messages, customer portal.
- Expected workshop impact: Reduces stalled repairs and improves revenue follow-up.
- Expected customer impact: Clearer quote status and easier approval communication.
- Expected marketing impact: Helps identify common quoted services worth explaining in content.

### 9. Improve balance and pickup readiness visibility

- Priority: P1
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: invoice/payment logic, ticket detail, dashboard, portal.
- Expected workshop impact: Better collection discipline and fewer forgotten balances.
- Expected customer impact: Clearer amount due before pickup.
- Expected marketing impact: Indirect; supports a more professional customer experience.

### 10. Improve low-stock alerts for daily work

- Priority: P1
- Estimated complexity: Medium
- Estimated development effort: 2-3 days
- Dependencies: inventory thresholds, dashboard/catalog views, current inventory movement logic.
- Expected workshop impact: Prevents delays caused by missing key parts.
- Expected customer impact: More reliable repair timelines.
- Expected marketing impact: Helps choose services to promote based on available stock.

### 11. Track part usage by repair type

- Priority: P1
- Estimated complexity: Medium
- Estimated development effort: 3-5 days
- Dependencies: invoice items, catalog item types, inventory movements, consistent service categories.
- Expected workshop impact: Better cost control and purchasing decisions.
- Expected customer impact: More accurate quotes and fewer part-related delays.
- Expected marketing impact: Identifies high-volume or high-margin repair categories.

### 12. Improve customer-facing status language

- Priority: P1
- Estimated complexity: Low
- Estimated development effort: 1-2 days
- Dependencies: portal labels, ticket status labels, message templates, PDF language.
- Expected workshop impact: Staff can communicate status with less explanation.
- Expected customer impact: Customers understand repair progress without raw technical state names.
- Expected marketing impact: Reinforces professional brand tone.

### 13. Improve portal link sharing workflow

- Priority: P1
- Estimated complexity: Low
- Estimated development effort: 1-2 days
- Dependencies: ticket detail, public token, portal routes, message templates.
- Expected workshop impact: Reduces repetitive "how is my device?" questions.
- Expected customer impact: Easier self-service tracking.
- Expected marketing impact: Builds trust and makes the workshop look more professional.

### 14. Create service-specific content templates

- Priority: P1
- Estimated complexity: Low
- Estimated development effort: 1-2 days
- Dependencies: `docs/MARKETING_CONTENT_ENGINE.md`, service categories, brand/voice rules.
- Expected workshop impact: Makes it easier to promote profitable services.
- Expected customer impact: Customers better understand what the workshop repairs.
- Expected marketing impact: Direct impact: reusable drafts for Google Business, Instagram, Facebook, TikTok, and educational posts.

### 15. Create safe completed-repair content draft workflow

- Priority: P1
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: ticket detail, content safety rules, private file/photo review, manual approval.
- Expected workshop impact: Turns real work into proof of expertise.
- Expected customer impact: No direct operational impact, but improves trust if content is safe and accurate.
- Expected marketing impact: High. Creates repeatable content from actual repairs without exposing private data.

## Phase 3 - Next Quarter

### 16. Add clearer warranty handling

- Priority: P1
- Estimated complexity: Medium
- Estimated development effort: 3-5 days
- Dependencies: ticket detail, customer communication templates, notes, possible PDF/customer-facing wording.
- Expected workshop impact: Reduces confusion, disputes, and inconsistent warranty responses.
- Expected customer impact: Clearer expectations and more professional follow-up.
- Expected marketing impact: Supports trust messaging, but should not overpromise warranty terms.

### 17. Add pickup and balance reminder drafts

- Priority: P2
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: ticket state, invoice/payment balance, message templates, portal link.
- Expected workshop impact: Helps collect balances and clear ready devices.
- Expected customer impact: Better reminders without surprise balances.
- Expected marketing impact: Indirect. Improves customer experience and repeat trust.

### 18. Add supplier notes for tracked parts

- Priority: P2
- Estimated complexity: Low
- Estimated development effort: 1-2 days
- Dependencies: catalog/inventory UI, current inventory model or safe metadata path.
- Expected workshop impact: Helps remember source, quality, and expected cost of parts.
- Expected customer impact: Better part availability and quote accuracy.
- Expected marketing impact: Indirect. Helps maintain service consistency.

### 19. Add dead stock review

- Priority: P2
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: inventory history, movement dates, catalog items, usage data.
- Expected workshop impact: Reduces money trapped in parts that do not move.
- Expected customer impact: Indirect. Frees cash for useful parts.
- Expected marketing impact: Indirect. Helps focus promoted services around real demand.

### 20. Add basic service profitability review

- Priority: P2
- Estimated complexity: Medium
- Estimated development effort: 4-7 days
- Dependencies: service categories, invoices, payments, inventory costs, possibly time notes.
- Expected workshop impact: Helps decide which services to promote, adjust, or stop offering.
- Expected customer impact: Better pricing consistency and clearer service focus.
- Expected marketing impact: High. Identifies which services deserve content and campaigns.

### 21. Track inquiry/source notes manually

- Priority: P2
- Estimated complexity: Medium
- Estimated development effort: 2-4 days
- Dependencies: customer/ticket forms, source labels, reporting later.
- Expected workshop impact: Helps understand where customers come from.
- Expected customer impact: No direct impact.
- Expected marketing impact: High. Connects Google/social/referrals to actual repair work.

### 22. Move email sending closer to the outbox worker

- Priority: P2
- Estimated complexity: Medium/High
- Estimated development effort: 4-7 days
- Dependencies: `IntegrationEvent`, `MessageLog`, email provider, worker, retry rules.
- Expected workshop impact: More reliable communication and less request-time fragility.
- Expected customer impact: Fewer missed transactional updates.
- Expected marketing impact: Low now, but creates safer foundation for future communication automation.

### 23. Add derived notifications for operational alerts

- Priority: P2
- Estimated complexity: Medium
- Estimated development effort: 3-6 days
- Dependencies: dashboard data, tickets waiting approval, low stock, unpaid balances, ready-for-pickup tickets.
- Expected workshop impact: Surfaces urgent operational work without needing to search.
- Expected customer impact: Faster follow-up and fewer delayed repairs.
- Expected marketing impact: Low direct impact.

### 24. Improve operational reporting for owner review

- Priority: P2
- Estimated complexity: Medium
- Estimated development effort: 4-7 days
- Dependencies: dashboard, tickets, invoices, payments, inventory, service categories.
- Expected workshop impact: Helps weekly decisions: what is pending, what is profitable, what is stuck, what needs stock.
- Expected customer impact: Indirect through better workshop management.
- Expected marketing impact: Supports choosing campaigns based on actual workshop performance.

## Explicitly Excluded From Q3 Execution

These are intentionally excluded because they do not produce immediate direct value for the internal workshop or carry too much risk right now:

- Multi-tenant SaaS architecture.
- Public subscription pricing.
- SaaS onboarding.
- Online payments.
- Fiscal invoicing.
- Full WhatsApp integration.
- n8n production automations.
- AI repair diagnosis.
- Automatic social publishing.
- Complex supplier/procurement system.
- Enterprise CRM pipeline.

## Reality Checker Notes

- If a task does not make intake, repair tracking, quoting, payment, inventory, communication, or content creation better, it should not enter this plan.
- If a task requires schema changes, it must be justified by real workshop value.
- If a task touches customer data, portal, files, payments, or messaging, security review is required.
- If a task produces marketing content, output must be draft-only and human-approved.
- If a task sounds like SaaS infrastructure, defer it unless the user explicitly changes the mission.
