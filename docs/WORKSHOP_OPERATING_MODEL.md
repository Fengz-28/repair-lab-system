# RepairLab - Workshop Operating Model

## Purpose

This document describes how the electronics/repair workshop should operate using RepairLab.

RepairLab's job is to make this workflow faster, clearer, more profitable, and easier to communicate.

## Operating Principles

- Capture information once and reuse it across the workflow.
- Keep repair status visible.
- Preserve customer and device history.
- Protect private customer and device data.
- Make quotes, invoices, and payments traceable.
- Keep inventory practical.
- Turn completed work into safe content opportunities.
- Prioritize mobile-first usage inside the workshop.

## 1. Device Intake

Goal:

Receive a device quickly while capturing enough information to avoid confusion later.

Capture:

- Customer name and contact.
- Device type, brand/model, and serial if available.
- Reported problem.
- Accessories received.
- Physical condition.
- Photos of damage/accessories when useful.
- Initial notes.

Output:

- Customer record.
- Device record.
- Intake record.
- Repair ticket.
- Public tracking token.
- Private file assets if photos are uploaded.

## 2. Diagnosis

Goal:

Understand the issue, record findings, and decide the next step.

Capture:

- Diagnosis notes.
- Symptoms confirmed.
- Possible cause.
- Parts needed.
- Risk or uncertainty.
- Whether quote approval is required.

Output:

- Ticket status updated.
- Quote created if needed.
- Customer communication prepared if needed.

## 3. Quote

Goal:

Communicate cost clearly before repair work proceeds.

Capture:

- Labor/service lines.
- Parts/product lines.
- Total.
- Customer-facing notes.
- Internal notes separately.

Rules:

- Do not send empty quotes.
- Do not approve quotes with total <= 0.
- Quote approval should update ticket state.

Output:

- Quote PDF.
- Customer portal quote visibility.
- Message/email log when applicable.

## 4. Approval

Goal:

Make it clear whether the customer accepted, rejected, or delayed the repair.

Possible outcomes:

- Approved: repair can continue.
- Rejected: ticket returns to diagnosis or cancellation path.
- Expired: quote requires follow-up or update.

## 5. Repair

Goal:

Perform work while preserving status and internal notes.

Capture:

- Work performed.
- Parts used.
- Tests completed.
- Remaining issue, if any.
- Internal technical notes.

Output:

- Updated ticket state.
- Inventory impact when applicable.
- Final invoice when approved quote is converted.

## 6. Payment

Goal:

Track what was charged, paid, and still pending.

Capture:

- Payment method.
- Amount.
- Date.
- Notes if needed.

Rules:

- Do not allow payment greater than balance.
- Partial payments must keep remaining balance visible.
- Full payment should update payment status.

## 7. Delivery

Goal:

Close the operational loop when the customer picks up the device.

Capture:

- Delivered state.
- Payment completion if required.
- Pickup notes if useful.
- Warranty notes when applicable.

Output:

- Ticket delivered/closed.
- Repair history preserved.
- Possible content opportunity marked for review.

## 8. Warranty

Goal:

Keep warranty handling clear and professional.

Capture:

- Original ticket reference.
- Customer claim.
- Warranty terms, if defined.
- New diagnosis.
- Resolution.

Do not promise warranty coverage automatically. Warranty terms should be decided by the workshop.

## 9. Inventory Usage

Goal:

Use inventory to support repairs without becoming a complex warehouse system.

Track:

- Frequently used parts.
- High-cost parts.
- Parts that delay delivery when missing.
- Parts linked to quote/invoice lines.

Avoid:

- Over-tracking small consumables too early.
- Advanced supplier workflows before real demand exists.

## 10. Customer Communication

Goal:

Communicate status professionally and reduce repeated questions.

Use:

- Portal link.
- Ticket code.
- Quote PDF.
- Invoice PDF.
- Clear message templates.

Do not expose:

- Internal notes.
- Audit logs.
- Inventory cost.
- Private photos unless approved for sharing.

## 11. Content Generation Opportunities

Some repairs can become content drafts if safe.

Good candidates:

- Clear before/after repair.
- Common issue explanation.
- Preventive maintenance tip.
- Interesting diagnostic case.
- Service explanation.

Required safety:

- Remove personal customer data.
- Remove serial numbers.
- Use photos only with approval.
- Avoid unrealistic promises.
- Keep tone educational and trustworthy.

## Metrics To Track

Operations:

- Tickets received.
- Tickets delivered.
- Average diagnosis time.
- Quote approval time.
- Repair completion time.
- Tickets waiting approval.
- Tickets ready for pickup.

Financial:

- Quoted amount.
- Invoiced amount.
- Paid amount.
- Pending balance.
- Average ticket value.
- Revenue by service category.

Inventory:

- Low-stock parts.
- Parts used.
- Parts cost.
- Stockouts.

Marketing:

- Content opportunities.
- Drafts created.
- Posts approved.
- Leads by service type when tracked.
