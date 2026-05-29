# RepairLab Agent Rules

These rules apply to every specialized RepairLab agent.

## Project Positioning

RepairLab is first an internal workshop operating system for managing an electronics/repair workshop.

Primary mission:
- Run the workshop faster, cleaner, and more profitably.
- Preserve repair history, customer history, device history, quotes, invoices, payments, inventory, communication, and evidence.
- Help the workshop communicate professionally and build customer trust.

Secondary mission:
- Use real repair work to support marketing, customer education, content drafts, campaigns, and local customer acquisition.

Future optional mission:
- If RepairLab proves valuable in daily internal use, it may later become a commercial SaaS product.

RepairLab is not primarily a SaaS startup right now. Agents must not optimize for subscriptions, investor-style growth, or multi-tenant architecture unless the user explicitly asks for that phase.

## Core Stack

- Next.js App Router
- React
- TypeScript strict mode
- TailwindCSS
- shadcn/ui
- Prisma
- PostgreSQL
- Server Actions

## Primary Context Documents

- `docs/PRODUCT_VISION.md`
- `docs/BUSINESS_MODEL.md`
- `docs/WORKSHOP_OPERATING_MODEL.md`
- `docs/MARKETING_CONTENT_ENGINE.md`
- `docs/CURRENT_STATE.md`
- `docs/ARCHITECTURE_MAP.md`
- `docs/SYSTEM_OVERVIEW.md`
- `docs/TECH_DEBT.md`
- `docs/NEXT_STEPS.md`

## Design Context Documents

- `docs/design-system/visual-language.md`
- `docs/design-system/motion-system.md`
- `docs/design-system/component-philosophy.md`
- `docs/design-system/interaction-rules.md`
- `docs/design-system/implementation-roadmap.md`

## Global Rules

- Optimize for internal workshop usefulness first.
- Every new feature must answer: how does this help the workshop operate better, earn more, reduce mistakes, or build customer trust?
- Do not prioritize SaaS features unless explicitly requested.
- Do not build multi-tenant unless the user explicitly says to.
- Prefer simple operational workflows over complex enterprise features.
- Mobile-first is mandatory because workshop work may happen from a phone or tablet.
- Keep TypeScript strict. Do not introduce `any`.
- Maintain accessibility: contrast, focus states, keyboard access, semantic labels.
- Prefer reusable components over one-off UI.
- Keep UI consistent with the RepairLab design system.
- Preserve the existing repair workflow unless the task explicitly asks to change it.
- Do not break admin auth, portal token access, PDFs, storage, backups, worker, or CI.
- Do not change Prisma schema or migrations without explicit approval and a clear operational reason.
- Do not install dependencies unless the value is explicit and the risk is documented.
- Do not hardcode secrets. Use `.env` and document variable names in `.env.example`.
- Protect customer data, repair history, device photos, payment history, and private files.
- Private reception photos are private by default and must not be served publicly without authorization.
- Marketing content must be generated as drafts first.
- Do not publish content automatically without explicit human approval.
- Avoid feature creep.

## Workshop-First Decision Filter

Before recommending or implementing work, ask:

- Does this reduce time at reception?
- Does this improve diagnosis or repair tracking?
- Does this prevent lost information?
- Does this help quote, invoice, collect, or deliver faster?
- Does this improve parts/inventory control?
- Does this improve customer trust?
- Does this help create useful marketing content from real repairs?
- Is there a simpler version that helps the workshop sooner?

If the answer is unclear, defer or ask for clarification.

## Output Contract

Every agent response should include:
- Summary of the recommendation or change.
- Workshop value.
- Files likely touched or actually touched.
- Risks and assumptions.
- Validation plan or validation results.
- Clear next step.

## Stop Conditions

Stop and ask for explicit approval before:
- Creating migrations.
- Changing authentication/session behavior.
- Adding external providers.
- Introducing new infrastructure services.
- Publishing content automatically.
- Exposing customer/device/repair data externally.
- Deleting data or files.
- Making a large refactor outside the requested scope.
