# RepairLab Motion System

Motion is one of the main ways RepairLab can evolve from a static admin UI into a premium, tactile, Level 4-style product. Movement should communicate hierarchy, intention, state, and interactivity. It must never decorate for its own sake.

This document defines the motion language for future phases. No dependency is required by this document.

## Motion Philosophy

RepairLab motion should feel:

- precise
- technical
- tactile
- fast but not rushed
- calm under operational pressure
- useful for understanding state

Motion should answer questions:

- Is this clickable?
- Did my action happen?
- Which item is active?
- Which state changed?
- Is this loading?
- What requires attention?

If motion does not help answer one of those questions, it probably should not exist.

## Principles

- Motion must communicate.
- Motion must be subtle.
- Motion must be consistent.
- Motion must feel tactile.
- Motion must not distract.
- Motion must not hurt mobile performance.
- Motion must preserve clarity in dense operational screens.

## What To Avoid

Avoid:

- exaggerated bounces
- videogame-like motion
- strong blinking
- many elements animating at the same time
- `transition-all` without intent
- large transforms
- infinite loops without operational meaning
- neon pulses across large surfaces
- animating expensive layout properties
- motion that makes mobile feel heavy

## Recommended Timing

Use these as defaults:

| Interaction | Duration |
| --- | ---: |
| Hover | 120ms-180ms |
| Button press | 100ms-140ms |
| Card hover | 160ms-220ms |
| Panel enter | 200ms-260ms |
| Modal enter/exit | 220ms-300ms |
| Table row hover | 120ms-160ms |
| Status pulse | 2.5s-3.5s |

Fast interactions should feel immediate. Larger spatial transitions can take slightly longer.

## Recommended Easing

- Use `ease-out` for appearance and reveal.
- Use `ease-in` for exit.
- Use `ease-in-out` for state transitions.
- Use spring only if extremely subtle.

Default motion should feel like a precision instrument, not an animation demo.

## Hover System

### Cards

Cards should respond with:

- minimal `translate-y`, usually `-0.5`
- clearer border
- subtle cyan or emerald glow
- slightly deeper shadow
- no aggressive scale

Good pattern:

```txt
default card
-> hover: slight lift + border-cyan + soft shadow
```

Avoid:

- large movement
- rotating cards
- bright glow on every card
- making dense lists visually unstable

### Buttons

Buttons should respond with:

- brightness or surface change
- border clarity
- subtle shadow change
- active/pressed feedback
- clear disabled state

Primary emerald buttons may use dark text for contrast. Secondary buttons should remain visible on dark backgrounds.

### Sidebar/Nav

Navigation should communicate active position.

Recommended:

- active item has a visible surface
- optional left indicator
- hover surface slightly elevated
- icon opacity/brightness change
- no excessive glow on every nav item

### Table Rows

Rows should support scanning.

Recommended:

- subtle elevated row background on hover
- selected state clearly distinct
- actions visible without jumping layout
- avoid per-row heavy glow in dense tables

## Enter Animations

Use reveal animations for high-level layout areas:

- dashboard metric cards
- page panels
- empty states
- modal content
- dropdowns

Recommended patterns:

- dashboard cards: fade + small translateY
- panels: fade + translateY 6-10px
- modals: fade + scale `0.98 -> 1`
- dropdowns: fade + slight slide

Avoid:

- animating every table row on every render
- long stagger sequences
- large movement on mobile

## Status Animations

Status motion should be meaningful.

### Badge Dots

Live or waiting states may use a subtle dot pulse.

Good candidates:

- waiting approval
- diagnosing
- in repair
- pending payment
- low stock warning

Do not pulse:

- completed
- closed
- paid
- delivered
- static neutral metadata

### Urgent State

Urgent can use slightly stronger emphasis, but should not feel like an alarm unless the workflow truly requires emergency handling.

### Completed State

Completed states should feel stable and confident. No blinking.

### Loading

Prefer:

- skeletons
- shimmer
- progressive reveal
- disabled action with clear label

Avoid default spinners as the primary experience unless the wait is very short.

## Framer Motion Policy

Framer Motion is not installed in this phase.

In Phase B, Framer Motion may be considered only if the value is clear, such as:

- modal transitions
- animated presence
- dashboard reveal
- staggered lists
- notifications/toasts
- complex layout transitions

If proposed, justify:

- which components need it
- why Tailwind-only motion is insufficient
- performance risk
- fallback behavior
- whether reduced motion can be respected

Do not add Framer Motion just for hover effects.

## Tailwind-Only Motion

RepairLab can already solve many motion needs with Tailwind and CSS:

- hover transitions
- focus states
- button press feedback
- pulse dots
- skeletons
- simple reveal classes
- border/shadow transitions
- transform/opacity transitions

Prefer Tailwind/CSS for:

- cards
- buttons
- badges
- table rows
- forms
- focus-visible states

Use JS animation only when component lifecycle or layout transitions require it.

## Performance Rules

- Prefer `transform` and `opacity`.
- Avoid animating layout dimensions in dense areas.
- Avoid animating blur heavily.
- Avoid many simultaneous shadows.
- Keep infinite animations rare.
- Mobile should not feel slower because of visual polish.

## Reduced Motion Future Requirement

Future implementation should support reduced motion:

- no pulsing dots
- no reveal transitions
- no animated modals
- retain visual state through static styling

This can be handled later through CSS media queries or a motion abstraction.
