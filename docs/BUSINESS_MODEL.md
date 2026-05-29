# RepairLab Workshop Business Model

## Purpose of this document

This document defines how RepairLab supports the user's electronics/repair workshop as a business.

The primary business is the workshop.

RepairLab is the internal operating system that helps the workshop sell services, manage repairs, control parts, communicate professionally, collect payments, and create marketing content from real work.

RepairLab may later become a SaaS, but that is a future option after internal validation.

## Primary business: electronics/repair workshop

The workshop earns money by diagnosing, repairing, maintaining, refurbishing, and supporting electronic devices.

Possible service areas:

- Game consoles.
- Controllers.
- Phones.
- Laptops.
- Desktop PCs.
- Tablets.
- Graphics cards.
- Electronic boards.
- HDMI/USB/power port repairs.
- Microsoldering.
- Preventive maintenance.
- Deep cleaning.
- Refurbished devices or accessories.
- Spare parts or replacement parts when appropriate.

These categories are hypotheses and should be prioritized by actual demand, margin, difficulty, parts availability, and technician time.

## Role of RepairLab in the workshop

RepairLab supports revenue by improving the workshop's daily execution.

It helps:

- Capture complete intake information.
- Preserve device/customer history.
- Track repair status.
- Create quotes faster.
- Convert approved quotes into invoices.
- Track manual payments and balances.
- Link parts usage to repairs.
- Protect private photos and evidence.
- Give customers a professional portal.
- Generate content drafts from completed repairs.
- Understand which services are worth promoting.

The system's value is not software for its own sake. Its value is better workshop control.

## Revenue sources

Possible workshop revenue sources:

- Diagnostic fees.
- Repair labor.
- Parts and component replacement.
- Preventive maintenance.
- Deep cleaning.
- Console repair packages.
- Controller repair packages.
- Laptop/PC maintenance.
- Microsoldering jobs.
- Data recovery or backup help, if offered.
- Refurbished device sales, if inventory supports it.
- Accessories and parts resale, if profitable.

RepairLab should help measure which sources are profitable and which consume too much time.

## Customer types

Possible customer types:

- Walk-in customers.
- Repeat local customers.
- Console gamers.
- Phone users.
- Students.
- Small businesses with laptops/PCs.
- Customers referred by previous repairs.
- Customers from Google Business, social media, or local recommendations.

RepairLab should help preserve customer history and improve repeat service.

## Operational workflow

The core workflow:

```txt
Device intake
  -> Diagnosis
  -> Quote
  -> Customer approval
  -> Repair
  -> Invoice
  -> Payment
  -> Delivery
  -> Follow-up / warranty context
  -> Content opportunity if safe
```

RepairLab should make this flow faster, more traceable, and easier to communicate.

## Quotes, invoices, and profitability

Quotes support profitability by:

- Making labor and parts visible.
- Avoiding informal price confusion.
- Creating approval history.
- Helping identify common services and pricing gaps.

Invoices and payments support profitability by:

- Showing paid vs pending balances.
- Reducing forgotten partial payments.
- Linking revenue to ticket and customer history.
- Making it easier to see completed work.

RepairLab should help answer:

- Which services generate the most revenue?
- Which services consume too much time?
- Which repairs often need expensive parts?
- Which tickets remain unpaid?
- Which customers or device types are common?

## Inventory strategy

Inventory should remain practical.

Track parts that:

- Are used frequently.
- Delay repair delivery when unavailable.
- Represent meaningful cost.
- Affect quote accuracy.
- Are easy to lose or overbuy.

Avoid overcomplicating:

- Rare parts.
- Low-cost items that do not affect decisions.
- Supplier workflows before real purchasing pain exists.

Inventory goals:

- Avoid running out of critical parts.
- Avoid buying slow-moving stock.
- Understand part usage by repair type.
- Protect margins by knowing parts cost.

## Marketing engine

RepairLab should help market the workshop using real repair activity.

Marketing should focus on:

- Trust.
- Expertise.
- Before/after proof when approved.
- Educational repair tips.
- Clear service explanations.
- Local availability.
- Professional communication.

Marketing channels:

- Google Business Profile.
- Instagram.
- Facebook.
- TikTok.
- Local referrals.
- Blog/SEO content.

RepairLab should not publish automatically. It should generate drafts for human review.

## Content engine

Completed or interesting repairs can become draft content.

Examples:

- "PS5 HDMI port replacement: what symptoms to watch for."
- "Why preventive console cleaning matters."
- "Common causes of controller drift."
- "Before/after repair caption."
- "Customer-friendly explanation of a quote."

Content must never expose:

- Customer name.
- Phone.
- Email.
- Address.
- Serial number.
- Private notes.
- Private photos without approval.
- Sensitive device information.

## Customer trust

RepairLab improves customer trust through:

- Ticket codes.
- Clear status updates.
- Quote PDFs.
- Invoice PDFs.
- Customer portal.
- Professional messages.
- Repair history.
- Evidence photos kept internally.

Trust should be practical, not performative. Customers should know what is happening and what action is needed.

## Key workshop metrics

Operational metrics:

- Tickets received per week.
- Tickets delivered per week.
- Average time from intake to diagnosis.
- Average time from quote to approval.
- Average time from approval to delivery.
- Tickets waiting approval.
- Tickets ready for pickup.

Financial metrics:

- Revenue by service type.
- Total quoted.
- Total invoiced.
- Total paid.
- Pending balances.
- Average ticket value.
- Parts cost per repair, if tracked.

Inventory metrics:

- Low-stock parts.
- Parts used by repair type.
- Slow-moving stock.
- Stockout events.

Marketing metrics:

- Content drafts created.
- Posts published after review.
- Leads from Google/social/referrals.
- Services that generate inquiries.

## Cost control

RepairLab should help control:

- Parts overbuying.
- Forgotten unpaid balances.
- Time spent answering status questions.
- Time lost searching for customer/device history.
- Rework caused by incomplete intake.
- Missed follow-up on quote approval.

## Future SaaS Path

RepairLab may become a SaaS only after being validated in daily internal workshop use.

Signals that SaaS exploration may make sense:

- The internal workshop uses it consistently.
- It clearly saves time or increases revenue.
- Other shops ask to use it.
- The workflow is stable.
- Backups, security, storage, deployment, and support are strong enough.
- The product can be explained simply to another shop owner.

SaaS should not be prioritized before internal validation.

Future SaaS work would require:

- Multi-tenant architecture.
- Stronger production deployment.
- External backups.
- Formal secrets management.
- Tenant isolation.
- Support process.
- Pricing validation.
- Onboarding flow.
- Legal/privacy review.

## What not to prioritize yet

Do not prioritize yet:

- Multi-tenant.
- Public subscription pricing.
- Investor-style metrics.
- Online payments.
- Fiscal invoicing.
- Full WhatsApp automation.
- AI repair decisions.
- Automated publishing.
- Complex procurement.
- Advanced enterprise reporting.
- Large CRM/sales pipeline features.

## How agents should use this document

- Workshop CEO Agent: use it to prioritize profitable services and avoid distractions.
- Workshop Operations Agent: use it to improve the repair workflow.
- Inventory Agent: use it to keep stock decisions practical.
- Local Marketing Agent: use it to promote real repair services.
- Content Agent: use it to draft safe content from repair work.
- Customer Relations Agent: use it to improve trust and communication.
- Reality Checker Agent: use it to reject SaaS-first work that does not help the workshop now.

If a recommendation optimizes for SaaS growth before workshop usefulness, it should be marked as future-phase only.
