# RepairLab Interaction Rules

These rules define how RepairLab should respond to users. They apply to admin screens, public pages, and the customer portal.

## Clickable Elements

Every clickable element must have:

- visible hover state
- accessible `focus-visible`
- active/pressed feedback
- clear disabled state

Clickable elements include:

- buttons
- links styled as buttons
- cards that navigate
- table row actions
- dropdown triggers
- modal actions
- tabs/filters

If an element is clickable but does not visually respond, it is unfinished.

## Status Communication

Every important state must communicate through more than one channel:

- color
- text
- shape/icon/dot
- consistent location

Examples:

- `Pagada` should be emerald, readable, and stable.
- `Esperando aprobacion` can use violet/amber and subtle live dot.
- `Urgente` can use red, but should avoid alarm-style flashing.
- `Cerrado` should feel resolved and quiet.

Do not rely only on color.

## Mobile Rules

Mobile is a first-class RepairLab surface.

Rules:

- touch targets should be comfortable
- buttons should not be cramped
- primary actions should remain easy to find
- tables must adapt or scroll correctly
- cards should stack with clear spacing
- long ticket/customer/device text must wrap safely
- sticky/side panels must become normal stacked content

Avoid:

- tiny action links
- horizontally overflowing forms
- hidden critical actions
- metadata that becomes unreadable

## Accessibility

RepairLab must maintain basic accessibility even while becoming more premium.

Required:

- sufficient contrast
- visible focus
- semantic button/link usage
- clear labels
- error text that explains the issue
- state not communicated by color alone

Future requirement:

- reduced motion support for pulse/reveal/modal transitions

## Performance

Visual polish should not make the app feel slow.

Prefer:

- transform
- opacity
- border-color
- background-color
- box-shadow used sparingly

Avoid:

- animating layout dimensions in dense screens
- excessive blur
- many simultaneous glows
- infinite animations on many elements
- heavy JS animation where CSS is enough

Dense screens like tickets, messages, customers, and inventory should prioritize responsiveness over decorative motion.

## UX Feedback

Every transition should have a purpose.

### Loading

Loading should reduce uncertainty:

- show skeletons that match layout
- disable actions while processing
- keep labels clear
- avoid generic spinners for long waits

### Empty States

Empty states must guide:

- what is missing
- why it matters
- what to do next

Example:

```txt
No hay cotizaciones todavia.
Crea una cotizacion para definir precios antes de enviarla al cliente.
```

### Errors

Errors should explain:

- what happened
- whether data was saved
- what the user can do

Avoid raw technical errors in UI.

### Success

Success states should feel satisfying but sober:

- clear confirmation
- no excessive animation
- next action visible

## Critical Actions

Critical actions must be harder to misread:

- destructive actions use red
- irreversible actions require confirmation
- disabled actions should explain why when possible
- financial state changes need clear feedback

Examples:

- registering payment
- closing ticket
- marking invoice paid
- adjusting inventory out
- expiring/rejecting quote

## Navigation

Navigation should always answer:

- where am I?
- where can I go next?
- what is the current operational context?

Admin shell should use:

- active item state
- consistent placement
- clear labels
- mobile-safe wrapping or compact mode

## Forms

Forms should feel stable and precise.

Required:

- labels visible
- helper text where needed
- placeholder not used as the only label
- focus ring visible
- errors close to the field
- submit button clearly visible

Avoid:

- dark text on dark fields
- navy fields that blend into panels
- weak placeholder contrast

## Tables and Lists

Tables and lists are operational surfaces.

Rules:

- row hover should be visible
- actions should be discoverable
- selected/active state should be clear
- mobile overflow must be controlled
- financial values should align and scan well

Avoid:

- light headers
- invisible borders
- links that look like body text
- action buttons with insufficient contrast
