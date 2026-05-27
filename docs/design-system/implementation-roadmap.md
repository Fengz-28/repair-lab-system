# RepairLab Design Implementation Roadmap

This roadmap guides the evolution of RepairLab toward a premium Level 4-style interface. It is intentionally incremental: RepairLab already has a working business workflow, so visual improvements must preserve logic and architecture.

## Phase A - Visual Foundation

Status: mostly completed.

### Objective

Establish dark consistency and a durable visual base.

### Scope

- dark-first global tokens
- zinc/neutral surfaces
- high-contrast buttons
- visible badges
- dark forms
- dark tables
- card/panel depth
- removal of accidental light surfaces

### Probable Files

- `src/app/globals.css`
- `src/components/repairlab/index.tsx`
- admin pages under `src/app/admin`
- domain UI components under `src/modules`
- public/customer portal components under `src/components/repairlab`

### Components To Review

- `RepairCard`
- `RepairPanel`
- `RepairButton`
- `RepairBadge`
- `RepairTable`
- form fields
- ticket status components

### Risks

- overusing global overrides
- inconsistent dark surfaces in secondary components
- buttons becoming invisible on black backgrounds
- mobile density becoming too tight

### Validation

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- visual scan for inherited light classes

### Acceptance Criteria

- no visible white panels
- buttons are readable
- inputs have dark explicit classes
- status badges are readable
- tables remain usable

## Phase B - Motion Language

Status: planned.

### Objective

Make RepairLab feel tactile and alive without becoming decorative or heavy.

### Scope

- hover depth
- tactile button feedback
- sidebar/nav active motion
- dashboard card reveal
- status microanimations
- modal/dropdown motion
- table row interaction

### Probable Files

- `src/app/globals.css`
- `src/components/repairlab/index.tsx`
- navigation components
- dashboard components
- ticket list/detail components
- modal/dialog wrappers if present

### Components To Review

- cards
- buttons
- badges
- sidebar/nav
- tables
- dropdown menus
- modals/dialogs
- dashboard metric cards

### Risks

- animating too many elements
- using `transition-all` everywhere
- making mobile feel slow
- excessive glow
- adding Framer Motion without clear value

### Validation

- lint/typecheck/tests
- manual hover/focus pass
- mobile performance scan
- reduced motion plan documented if animation expands

### Acceptance Criteria

- clickable elements feel responsive
- hover states are visible but subtle
- dashboard feels alive but stable
- status animations are limited to meaningful states
- no gaming/neon motion

## Phase C - Spatial UI

Status: planned.

### Objective

Improve depth, layout, and navigation so the admin shell feels like a coherent product environment.

### Scope

- layered panels
- floating surfaces
- overlays
- improved navigation depth
- richer dashboard composition
- stronger admin shell
- better relationship between primary content and sidebar content

### Probable Files

- admin layout/nav components
- `src/components/repairlab`
- dashboard page
- ticket detail page
- CRM detail page
- inventory page
- messages page

### Components To Review

- page heroes
- sticky sidebars
- section headers
- cards in grids
- overlays/dropdowns
- activity feeds

### Risks

- over-nesting cards
- visual hierarchy becoming too complex
- sticky sidebars breaking mobile
- layout changes accidentally hiding actions

### Validation

- desktop/tablet/mobile review
- keyboard navigation review
- scan for overflow
- lint/typecheck/tests

### Acceptance Criteria

- page structure is clearer
- sidebars feel intentional
- content layers are distinct
- mobile stacking is clean

## Phase D - Product Polish

Status: planned.

### Objective

Make the product feel complete in edge states, loading moments, success/error moments, and mobile usage.

### Scope

- skeletons
- empty states
- toasts
- onboarding hints
- loading feedback
- error/success feedback
- refined mobile UX
- advanced table/list interactions

### Probable Files

- shared feedback components
- action result components
- empty state components
- tables/lists
- forms
- dashboard/tickets/customers/inventory/messages pages

### Components To Review

- `RepairEmptyState`
- loading skeletons
- toast/notification layer
- form errors
- success confirmations
- table empty states
- portal customer states

### Risks

- adding decorative copy without improving clarity
- too many toasts
- loading states that do not match final layout
- mobile interactions becoming cluttered

### Validation

- manual E2E checklist
- mobile review
- lint/typecheck/tests
- accessibility smoke pass

### Acceptance Criteria

- empty states explain next action
- loading states reduce uncertainty
- errors explain what happened
- success states confirm clearly
- mobile feels polished

## General Rules For All Phases

- Do not change Prisma or business logic for visual work.
- Do not alter routes or Server Actions unless a product task requires it.
- Prefer existing RepairLab components.
- Keep changes incremental.
- Run validations after code changes.
- Document visual system decisions when they become reusable rules.
