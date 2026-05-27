# RepairLab Visual Language

RepairLab is a dark-first repair operations platform. Its interface should feel technical, premium, modern, sober, focused, and operational. The product is used to make decisions in a workshop: every screen should communicate status, priority, risk, money, inventory, and next action with confidence.

The Level 4 visual direction is not a skin. It is a product posture: deep dark space, clear hierarchy, tactile surfaces, subtle cyan/emerald energy, and precise operational density.

## Visual Philosophy

RepairLab should feel like:

- a professional SaaS for electronics repair operations
- a technical lab dashboard, not a generic admin template
- a workspace for repeated daily use
- calm, sharp, and trustworthy under pressure
- alive enough to provide feedback, but never noisy

The UI should make complex workshop workflows feel organized:

- intake
- tickets
- diagnosis
- quotes
- invoices
- payments
- inventory
- customer portal
- messages

## What To Avoid

Avoid:

- gamer aesthetics
- exaggerated neon
- excessive gradients
- crypto dashboard cliches
- saturated interfaces
- heavy shadows
- accidental light surfaces
- blue/navy dominance as the base identity
- generic template-looking UI
- decorative glow without functional meaning
- text that depends only on color to communicate state

RepairLab can use glow, gradients, glass, and motion, but these must support status, focus, hierarchy, or interactivity.

## Conceptual Palette

### Background

- Primary app background: deep black / zinc.
- Recommended feel: `black`, `zinc-950`, `neutral-950`, near-black custom surfaces.
- Cyan and emerald may appear as ambient accents, but never as the main page background.

### Surfaces

- Base surface: `zinc-950`, `neutral-950`.
- Secondary surface: `zinc-900/70`, `zinc-950/75`.
- Elevated surface: layered dark gradient, subtle border, controlled shadow.
- Avoid plain white surfaces entirely.

### Borders

- Default: `border-white/10`.
- Active/interactive: `border-cyan-300/30` or `border-emerald-300/30`.
- Semantic highlight: `border-amber-300/30`, `border-red-300/30`, `border-violet-300/30`.

### Accents

- Primary accent: cyan.
- Success/completed: emerald.
- Warning/pending: amber.
- Danger/urgent: red.
- Info/waiting: sky or violet.

## Depth System

RepairLab should use depth intentionally. Each layer has a purpose.

```txt
1. App Background
   Deep black, subtle radial ambience, no visual clutter.

2. Page Section
   Large layout regions with minimal separation and strong spacing.

3. Card Surface
   Operational grouping: ticket card, customer card, inventory card.

4. Elevated Card
   Important metric, financial state, next action, active record.

5. Hover State
   Slight lift, clearer border, subtle cyan/emerald glow.

6. Active/Focused State
   Visible focus ring, active border, stronger contrast.

7. Modal/Overlay
   Highest elevation, stronger shadow, clear escape path.
```

Depth should not be created by large shadows alone. Use a combination of:

- dark surface contrast
- soft border
- small highlight line
- controlled shadow
- subtle glow only where meaningful

## Borders

Borders provide structure without making the UI feel boxed in.

Use:

- `border-white/10` for default structure
- `border-cyan-500/15` for technical or active hover emphasis
- `border-emerald-500/15` for positive or primary areas
- `border-amber-500/20` for warning/pending
- `border-red-500/20` for urgent/error

Avoid:

- hard gray borders
- high contrast borders on every card
- using colored borders everywhere at once
- border colors that compete with status badges

## Glow

Glow must be subtle and functional. It should not feel like decoration or neon.

Use glow for:

- active navigation item
- important operational card
- hover on interactive cards
- focused input/action
- primary CTA
- status requiring attention

Do not use glow for:

- every card
- every badge
- normal static text
- repeated dense table rows
- decorative background noise

Good glow feels like depth. Bad glow feels like gaming neon.

## Typography

### Page Titles

- Strong, compact, high contrast.
- Used in hero/header regions.
- Should communicate the operational area quickly.

### Section Titles

- Bold, clear, smaller than page title.
- Should help scanning.

### Labels

- Uppercase or small bold where useful.
- Lower contrast than values.
- Use for metadata and form fields.

### Values

- High contrast.
- Financial values and ticket codes should be easy to scan.

### Metadata

- `zinc-400` / `zinc-500`.
- Dates, references, helper text, secondary descriptions.

### Badges

- Small but readable.
- Use color, text, and dot/icon when status matters.
- Never rely only on text color.

### Tables

- Headers: compact, uppercase or bold, low-noise.
- Rows: high readability, subtle hover.
- Actions: visible on hover or always visible if critical.

## Responsive Direction

Mobile must feel equally premium, not like a compressed desktop.

Rules:

- single-column layouts should preserve hierarchy
- buttons need comfortable touch targets
- cards should not feel cramped
- tables should become scrollable or card-like
- financial/status summaries should remain visible
- avoid tiny action links on mobile
- empty states should still guide the next step

RepairLab should feel like the same product on desktop, tablet, and phone.
