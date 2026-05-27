# RepairLab Component Philosophy

RepairLab components should feel premium, operational, and durable. They are not decorative pieces; they are instruments for running a repair workflow.

Every component should answer:

- What is this?
- What state is it in?
- Can I interact with it?
- What happens next?

## RepairCard

### Purpose

Group operational information such as tickets, customers, inventory items, messages, quotes, and invoices.

### Visual Direction

- dark zinc/neutral surface
- subtle border
- mild depth
- optional top highlight line
- controlled cyan/emerald hover glow

### Interaction

- slight lift on hover
- border becomes clearer
- shadow deepens subtly
- no aggressive scale

### Common Errors

- flat card with no depth
- white/light surface
- too much glow on every card
- hover that changes layout

### Quality Criteria

- readable in dense grids
- clickable state is obvious
- mobile card remains scan-friendly

## RepairPanel

### Purpose

Hold section-level content: forms, tables, sidebar groups, summaries.

### Visual Direction

- darker than card or same-level surface depending on layout
- stronger containment than plain sections
- no decorative noise

### Interaction

Panels are usually static. If interactive, use the same subtle hover system as cards.

### Common Errors

- making every section look like a separate floating app
- nested cards inside cards without hierarchy
- overusing borders

### Quality Criteria

- section hierarchy is clear
- content has breathing room
- form/table content remains legible

## RepairStatCard

### Purpose

Show important operational metrics.

### Visual Direction

- large number
- small label
- subtle accent
- optional progress or accent bar

### Interaction

- soft hover lift
- no distracting animations

### Common Errors

- numbers too small
- label/value contrast too similar
- using random accent colors

### Quality Criteria

- metric can be understood in one glance
- financial/status metrics use semantic color responsibly

## StatusBadge

### Purpose

Communicate status quickly and reliably.

### Visual Direction

StatusBadge should not be only colored text. It should communicate through:

- color
- text
- dot or icon
- border/surface contrast

### Interaction

- live states may use subtle dot pulse
- completed states should stay stable
- urgent states may be more pronounced, but not alarming by default

### Common Errors

- raw enum labels
- low contrast text
- relying only on color
- pulsing every badge

### Quality Criteria

- state is readable without knowing the color system
- long labels do not break layout
- mobile stays legible

## ProgressStatus

### Purpose

Show workflow progress: intake, diagnosis, approval, repair, pickup, delivered.

### Visual Direction

- horizontal on desktop when space allows
- vertical/compact on mobile
- completed/current/pending states clearly distinct

### Interaction

- current state can be subtly emphasized
- transitions should be calm

### Common Errors

- too many equal-weight steps
- current step not obvious
- mobile labels too cramped

### Quality Criteria

- user knows where the ticket is in the workflow
- completed states do not look clickable unless they are

## RepairTable

### Purpose

Show dense operational records.

### Visual Direction

- dark header
- clear row separation
- subtle hover
- compact but readable

### Interaction

- row hover background
- selected state if supported
- actions visible without layout jumps

### Common Errors

- table too wide on mobile without scroll
- light headers
- invisible row hover

### Quality Criteria

- supports scanning
- columns remain readable
- mobile has controlled overflow

## SectionHeader

### Purpose

Introduce major blocks and help scanning.

### Visual Direction

- strong title
- concise supporting text
- optional action aligned right

### Interaction

Actions should use consistent button hierarchy.

### Common Errors

- oversized headings inside compact panels
- vague titles
- too many actions

### Quality Criteria

- user understands section purpose instantly

## EmptyState

### Purpose

Explain absence of data and guide the next action.

### Visual Direction

- calm panel
- small icon/mark
- short title
- useful next step

### Interaction

- include CTA only when the next action is clear

### Common Errors

- "No data" with no guidance
- decorative illustration with no operational value
- disabled-looking empty states

### Quality Criteria

- user knows what to do next

## Form Fields

### Purpose

Capture operational data accurately.

### Visual Direction

- dark input surface
- `border-white/10`
- high-contrast text
- readable placeholder
- cyan/emerald focus

### Interaction

- focus-visible must be clear
- errors must be visible and specific
- disabled state must look intentionally disabled

### Common Errors

- navy fields against navy panels
- placeholder too dark
- focus state invisible

### Quality Criteria

- usable on mobile
- no text blends into background

## Buttons

### Purpose

Trigger actions and define priority.

### Visual Direction

- primary: emerald, high contrast
- secondary: visible dark surface with border
- destructive: red, clear but not oversized
- disabled: dark muted, not clickable-looking

### Interaction

- hover brightness/border/shadow
- active press feedback
- focus-visible ring

### Common Errors

- black button on black surface
- outline button with invisible border
- primary button with low-contrast text

### Quality Criteria

- action hierarchy is obvious
- touch targets are comfortable

## Sidebar/Nav

### Purpose

Orient users and provide fast access to operational areas.

### Visual Direction

- dark premium shell
- active item visible
- hover surface elevated
- no crowded nav on mobile

### Interaction

- active state clear
- hover state clear
- keyboard focus visible

### Common Errors

- active item only changes text color
- mobile nav too tight
- hover not visible

### Quality Criteria

- user always knows location

## Modals/Dialogs

### Purpose

Handle focused decisions or confirmations.

### Visual Direction

- elevated dark surface
- strong border/shadow
- clear title and actions

### Interaction

- future motion: fade + scale
- escape/cancel path clear
- focus trapped when implemented

### Common Errors

- modal blends into background
- destructive action too subtle
- no keyboard affordance

### Quality Criteria

- decision is clear and reversible when possible

## Toasts/Notifications

### Purpose

Confirm or explain system feedback.

### Visual Direction

- compact dark surface
- semantic border/accent
- concise text

### Interaction

- should appear/disappear calmly
- should not cover critical controls

### Common Errors

- generic success text
- too much motion
- color-only feedback

### Quality Criteria

- user understands outcome immediately

## Skeletons/Loading States

### Purpose

Reduce uncertainty while content loads.

### Visual Direction

- dark skeleton blocks
- subtle shimmer if used
- match final layout shape

### Interaction

- avoid heavy infinite animation

### Common Errors

- spinner for everything
- skeleton not matching final content
- too bright shimmer

### Quality Criteria

- loading feels intentional and stable
