# RepairLab - Real Frontend Audit

Fecha: 2026-05-29  
Alcance: auditoria real de frontend sobre `C:\Users\PC MASTER\repair-lab-system`.  
Modo: solo auditoria. No se modifico codigo de aplicacion.

## 1. Contexto Verificado

El proyecto real existe y contiene una aplicacion Next.js funcional.

Stack detectado en `package.json`:

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript `^5`
- TailwindCSS `^4`
- Prisma `^7.8.0`
- Vitest `^4.1.7`
- Zod `^4.4.3`

Scripts relevantes:

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npx tsc --noEmit`
- `npm run worker:events`
- `npm run backup`

## 2. Current UI Architecture

### App Router

Rutas principales detectadas:

- Publicas:
  - `src/app/page.tsx`
  - `src/app/services/page.tsx`
  - `src/app/products/page.tsx`
  - `src/app/contact/page.tsx`
  - `src/app/login/page.tsx`
  - `src/app/track/[token]/page.tsx`
  - `src/app/track/[token]/quote.pdf/route.ts`
  - `src/app/track/[token]/invoice.pdf/route.ts`

- Admin:
  - `src/app/admin/page.tsx`
  - `src/app/admin/dashboard/page.tsx`
  - `src/app/admin/intake/page.tsx`
  - `src/app/admin/tickets/page.tsx`
  - `src/app/admin/tickets/[ticketId]/page.tsx`
  - `src/app/admin/tickets/[ticketId]/quotes/page.tsx`
  - `src/app/admin/tickets/[ticketId]/invoices/[invoiceId]/page.tsx`
  - `src/app/admin/customers/page.tsx`
  - `src/app/admin/customers/[customerId]/page.tsx`
  - `src/app/admin/catalog/page.tsx`
  - `src/app/admin/messages/page.tsx`
  - `src/app/admin/messages/[messageId]/page.tsx`
  - `src/app/admin/files/[fileAssetId]/route.ts`

### Layout Global

Archivo: `src/app/layout.tsx`

Observaciones:

- El HTML esta forzado a dark mode con `className="dark h-full antialiased"`.
- `lang="en"` no coincide con la interfaz mayoritariamente en espanol.
- El body usa `bg-[#030303] text-zinc-100`.
- La metadata aun dice `Repair management platform`, mas SaaS generico que workshop-first.

Impacto:

- `lang="en"` afecta accesibilidad, lectores de pantalla, autotraduccion y percepcion profesional.
- La metadata no refleja el posicionamiento actual de sistema operativo interno del taller.

## 3. Component Architecture

### Design System Base

Archivo central:

- `src/components/repairlab/index.tsx`

Componentes base detectados:

- `RepairTopbar`
- `RepairNavbar`
- `RepairDropdownMenu`
- `RepairPageHero`
- `RepairContainer`
- `RepairPageShell`
- `RepairSection`
- `RepairSurface`
- `RepairGrid`
- `RepairFloatingPanel`
- `RepairCard`
- `RepairPanel`
- `RepairButton`
- `RepairBadge`
- `RepairTable`
- `RepairStatCard`
- `RepairEmptyState`
- `RepairSearchBar`
- `RepairInlineAlert`
- `RepairFormFeedback`
- `RepairActionBar`
- `RepairSkeleton`
- `RepairSkeletonCard`
- `RepairFooter`

### Feature Components

Componentes RepairLab especializados:

- Tickets:
  - `src/components/repairlab/ticket-hero.tsx`
  - `src/components/repairlab/ticket-sidebar.tsx`
  - `src/components/repairlab/ticket-timeline.tsx`
  - `src/components/repairlab/ticket-customer-card.tsx`
  - `src/components/repairlab/ticket-device-card.tsx`
  - `src/modules/tickets/components/ticket-actions.tsx`

- CRM:
  - `src/components/repairlab/customer-summary-card.tsx`
  - `src/components/repairlab/customer-hero.tsx`
  - `src/components/repairlab/customer-sidebar.tsx`
  - `src/components/repairlab/customer-ticket-history.tsx`
  - `src/components/repairlab/customer-devices-card.tsx`
  - `src/components/repairlab/customer-activity-feed.tsx`

- Inventory:
  - `src/components/repairlab/inventory-hero.tsx`
  - `src/components/repairlab/inventory-stats-grid.tsx`
  - `src/components/repairlab/inventory-item-card.tsx`
  - `src/components/repairlab/inventory-table.tsx`
  - `src/components/repairlab/low-stock-alert-panel.tsx`
  - `src/modules/catalog/components/catalog-admin.tsx`

- Portal:
  - `src/components/repairlab/client-tracking-hero.tsx`
  - `src/components/repairlab/public-repair-progress.tsx`
  - `src/components/repairlab/public-device-card.tsx`
  - `src/components/repairlab/public-quote-card.tsx`
  - `src/components/repairlab/public-invoice-card.tsx`
  - `src/components/repairlab/public-timeline.tsx`
  - `src/components/repairlab/public-contact-card.tsx`

- UX Layer:
  - `src/modules/ux/components/command-palette.tsx`
  - `src/modules/ux/components/activity-timeline.tsx`
  - `src/modules/ux/components/notifications-center.tsx`

## 4. Design System Consistency

### Strengths

- Existe una capa RepairLab reusable.
- La app ya es dark-first.
- Hay microinteracciones base en `src/app/globals.css`:
  - `repair-card-motion`
  - `repair-button-motion`
  - `repair-focus-ring`
  - `repair-table-row`
  - `repair-panel-reveal`
  - `repair-skeleton`
- Hay skeletons y empty states reutilizables.
- Command Palette y Notifications Center ya estan integrados en admin nav.
- El portal cliente tiene componentes separados del admin.

### Problems

#### 4.1 Overrides globales demasiado agresivos

Archivo: `src/app/globals.css`

Problema:

- Hay muchas reglas globales con `!important` que reescriben clases Tailwind como:
  - `.bg-white`
  - `.bg-zinc-50`
  - `.bg-zinc-900`
  - `.text-zinc-950`
  - `.border-zinc-200`
  - botones `bg-black` / `bg-zinc-950`

Por que importa:

- La UI puede verse correcta por accidente, pero los componentes siguen declarando estilos light-first.
- Dificulta predecir contraste, estados hover, surfaces y jerarquia.
- Reduce confianza para futuras mejoras visuales.

Complejidad: Media.  
Mejora esperada: tokens dark explicitos por componente, menos hacks globales, UI mas estable.

#### 4.2 Componentes mezclan dark-first con clases light heredadas

Archivos afectados:

- `src/components/repairlab/index.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/tickets/page.tsx`
- `src/modules/intake/components/intake-form.tsx`
- `src/modules/quotes/components/quote-admin.tsx`
- `src/modules/catalog/components/catalog-admin.tsx`
- `src/modules/payments/components/payment-admin.tsx`

Ejemplos:

- `text-zinc-950 dark:text-zinc-50`
- `text-zinc-800 dark:text-zinc-200`
- `text-zinc-600 dark:text-zinc-300`

Por que importa:

- RepairLab ya no tiene light mode. Mantener clases duales crea ruido y dependencia de overrides.
- Dificulta una auditoria visual confiable.

Complejidad: Media.  
Mejora esperada: dark mode mas consistente y menos regresiones.

#### 4.3 Encoding/localizacion rota en varios textos

Archivos afectados:

- `src/components/admin-nav.tsx`
- `src/components/repairlab/repair-nav-links.tsx`
- `src/modules/ux/components/command-palette.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/tickets/page.tsx`
- `src/app/admin/tickets/[ticketId]/page.tsx`
- `src/modules/intake/components/intake-form.tsx`
- `src/modules/quotes/components/quote-admin.tsx`
- `src/app/login/page.tsx`
- `src/app/login/login-form.tsx`

Ejemplos encontrados:

- `recepciÃ³n`
- `CatÃ¡logo`
- `TÃ©cnico`
- `CotizaciÃ³n`
- `diagnÃ³stico`
- `lÃ­nea`
- `ContraseÃ±a`

Por que importa:

- Es el problema visual/profesional mas evidente.
- Mata la confianza en un sistema que debe usarse con clientes reales.

Complejidad: Baja/Media.  
Mejora esperada: gran mejora de calidad percibida y profesionalismo.

## 5. Mobile Issues

### 5.1 Admin navbar puede comprimirse entre 1024px y 1280px

Archivos:

- `src/components/admin-nav.tsx`
- `src/components/repairlab/index.tsx`
- `src/components/repairlab/repair-nav-links.tsx`
- `src/modules/ux/components/command-palette.tsx`

Problema:

- `RepairTopbar` + `RepairNavbar` + usuario + notificaciones + command palette compiten por espacio.
- `AdminNav` usa `relative left-1/2 w-screen -translate-x-1/2`, lo que puede generar overflow o comportamientos raros dentro de layouts.
- El nav usa scroll horizontal en mobile, pero la densidad de links sigue alta.

Impacto workshop:

- En tablet/laptop pequena el staff puede perder acceso rapido a rutas clave.

Complejidad: Media.  
Mejora esperada: navegacion mas respirada, menos overflow, mejor uso en tablet.

### 5.2 Tablas siguen dependiendo de `min-w`

Archivos:

- `src/app/admin/tickets/page.tsx`
- `src/modules/quotes/components/quote-admin.tsx`
- `src/app/admin/tickets/[ticketId]/invoices/[invoiceId]/page.tsx`
- `src/modules/payments/components/payment-admin.tsx`
- `src/modules/catalog/components/catalog-admin.tsx`
- `src/components/repairlab/public-quote-card.tsx`

Problema:

- Varias tablas usan `min-w-[720px]`, `min-w-[760px]`, `min-w-[980px]`.
- Aunque hay overflow, mobile queda como "tabla desktop reducida".

Impacto workshop:

- En celular, revisar cotizaciones, inventario o tickets puede ser lento e incomodo.

Complejidad: Media/Alta.  
Mejora esperada: cards mobile especificas para flujos diarios.

### 5.3 Intake aun es un formulario largo

Archivo:

- `src/modules/intake/components/intake-form.tsx`

Problema:

- Cliente, equipo y recepcion se muestran en un formulario largo.
- Selects muestran valores crudos como `PHONE`, `TABLET`, `WHATSAPP`, `EMAIL`.
- File input es nativo y poco pulido.

Impacto workshop:

- Recepcion desde telefono/tablet toma mas tiempo y se siente menos profesional.

Complejidad: Media.  
Mejora esperada: recepcion mas rapida y menos errores de captura.

## 6. Ticket Workflow Issues

### 6.1 Ticket detail esta cerca de ser cockpit, pero aun es demasiado denso

Archivo:

- `src/app/admin/tickets/[ticketId]/page.tsx`

Problema:

- Mezcla timeline de estados, activity timeline derivado, cliente, equipo, cotizaciones, factura, mensajes, historial, archivos, sidebar, notas y acciones.
- Hay dos conceptos de timeline en la misma pantalla:
  - `RepairTicketTimeline`
  - `ActivityTimeline`
- La accion siguiente existe, pero no domina suficientemente la experiencia.

Impacto workshop:

- El tecnico o dueno puede tardar en responder "que sigue con este equipo?".

Complejidad: Alta.  
Mejora esperada: ticket detail como centro operativo real.

### 6.2 Estados de workflow no estan unificados visual/semantico

Archivos:

- `src/app/admin/tickets/page.tsx`
- `src/app/admin/tickets/[ticketId]/page.tsx`
- `src/modules/tickets/components/ticket-actions.tsx`
- `src/modules/customer-portal/tracking.service.ts`
- `src/modules/dashboard/dashboard.service.ts`

Problema:

- Hay multiples funciones locales de labels.
- Algunas etiquetas no tienen acentos.
- Algunos estados son tecnicos para cliente.

Impacto workshop:

- Aumenta riesgo de comunicacion inconsistente.

Complejidad: Media.  
Mejora esperada: estados coherentes en admin, portal, PDF y mensajes.

### 6.3 Quote flow tiene microcopy desactualizado

Archivo:

- `src/modules/quotes/components/quote-admin.tsx`

Problema:

- Para quote `APPROVED` dice: "El siguiente paso futuro sera convertirla en factura..." aunque el sistema ya maneja facturas.

Impacto workshop:

- Confunde a staff en un punto critico de dinero/flujo.

Complejidad: Baja.  
Mejora esperada: menor confusion al convertir cotizacion aprobada.

## 7. Dashboard Issues

Archivo:

- `src/app/admin/dashboard/page.tsx`

### 7.1 El dashboard sigue mezclando demo/checklist con operacion real

Problema:

- `DemoChecklist` se renderiza en el dashboard operativo.

Impacto workshop:

- Ocupa espacio que deberia priorizar trabajo real del dia.

Complejidad: Baja.  
Mejora esperada: dashboard mas serio y util para operacion diaria.

### 7.2 El dashboard es mas resumen que cola operacional

Problema:

- KPI cards son buenos, pero el flujo principal deberia ser:
  - que reparar hoy
  - que espera aprobacion
  - que espera repuestos
  - que esta listo para entregar
  - que debe dinero
  - que tiene bajo stock

Impacto workshop:

- El dashboard debe reducir busqueda manual y seguimiento mental.

Complejidad: Media.  
Mejora esperada: mejor control diario del taller.

### 7.3 Mezcla de idioma y acentos

Ejemplos:

- `Admin / Dashboard`
- `Items de catalogo`
- `Ultimos movimientos`
- `metodo`

Complejidad: Baja.  
Mejora esperada: interfaz mas profesional.

## 8. Customer Portal Issues

Archivos:

- `src/app/track/[token]/page.tsx`
- `src/components/repairlab/client-tracking-hero.tsx`
- `src/components/repairlab/public-repair-progress.tsx`
- `src/components/repairlab/public-quote-card.tsx`
- `src/components/repairlab/public-invoice-card.tsx`
- `src/components/repairlab/public-timeline.tsx`
- `src/modules/customer-portal/tracking.service.ts`

### 8.1 Portal es funcional, pero debe simplificarse aun mas para cliente

Problema:

- Componentes estan bien separados, pero varios textos tienen acentos faltantes.
- Tablas de cotizacion usan `min-w-[680px]`.
- El portal debe sentirse menos admin y mas "estado de reparacion".

Impacto customer:

- Mejor comprension del estado y mayor confianza.

Complejidad: Media.  
Mejora esperada: experiencia tipo Apple repair/status.

### 8.2 Estados del portal no deben heredar lenguaje interno

Archivo:

- `src/modules/customer-portal/tracking.service.ts`

Problema:

- Labels como `Revision iniciada`, `Reparacion aprobada`, `Cotizacion enviada` necesitan acentos y tono cliente.

Impacto:

- Reduce preguntas repetidas y mejora profesionalismo.

Complejidad: Baja.

## 9. Form/Input Problems

### 9.1 Formularios duplican estilos en vez de usar un field component

Archivos:

- `src/modules/intake/components/intake-form.tsx`
- `src/modules/quotes/components/quote-admin.tsx`
- `src/modules/catalog/components/catalog-admin.tsx`
- `src/modules/payments/components/payment-admin.tsx`
- `src/app/login/login-form.tsx`
- `src/app/contact/page.tsx`

Problema:

- Cada modulo define `fieldClassName` propio.
- Hay pequenas diferencias de focus, radius, height y spacing.

Impacto workshop:

- La app se siente menos consistente y es mas propensa a regresiones.

Complejidad: Media.  
Mejora esperada: campos mas consistentes, menos codigo repetido.

### 9.2 Selects muestran enums tecnicos en intake

Archivo:

- `src/modules/intake/components/intake-form.tsx`

Ejemplos:

- `PHONE`
- `TABLET`
- `WHATSAPP`
- `EMAIL`

Impacto workshop:

- Staff no tecnico recibe una interfaz menos humana.

Complejidad: Baja.  
Mejora esperada: recepcion mas clara.

### 9.3 Contact form publico es placeholder visual

Archivo:

- `src/app/contact/page.tsx`

Problema:

- Boton deshabilitado y formulario visual no funcional pueden confundir si la web publica se usa para clientes reales.

Impacto customer:

- Puede bajar conversion/confianza.

Complejidad: Baja/Media.  
Mejora esperada: dejar claro "pronto" o convertir a CTA real no destructivo.

## 10. Typography, Spacing And Layout

### 10.1 Tipografia global no usa la fuente configurada

Archivo:

- `src/app/globals.css`

Problema:

- `@theme` define `--font-sans: var(--font-geist-sans)`, pero `body` usa `Arial, Helvetica, sans-serif`.

Impacto:

- Jerarquia visual menos premium y posible inconsistencia con el setup esperado.

Complejidad: Baja.

### 10.2 Demasiados headers hero grandes para tareas operativas

Archivos:

- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/tickets/page.tsx`
- `src/app/admin/customers/page.tsx`
- `src/app/admin/messages/page.tsx`

Problema:

- `RepairPageHero` es visualmente fuerte. Para operacion diaria puede empujar contenido critico hacia abajo.

Impacto workshop:

- En pantallas pequenas, el staff ve marca/hero antes que trabajo pendiente.

Complejidad: Media.  
Mejora esperada: mas velocidad operativa.

### 10.3 Muchos paneles tienen peso visual similar

Archivos:

- `src/app/admin/tickets/[ticketId]/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/modules/catalog/components/catalog-admin.tsx`

Problema:

- Cards, floating panels, timeline, sidebars y summaries compiten por atencion.

Impacto:

- Jerarquia menos clara.

Complejidad: Media.

## 11. Color, Contrast And Dark Mode

### 11.1 La base negra existe, pero se aplana por overrides

Archivo:

- `src/app/globals.css`

Problema:

- `.bg-zinc-900`, `.bg-zinc-950`, `.bg-black` se fuerzan a valores muy cercanos.
- Esto puede hacer que cards, panels y background pierdan profundidad.

Impacto:

- Menor sensacion premium y menor separacion de capas.

Complejidad: Media.

### 11.2 Primary buttons tienen buen contraste, pero muchas acciones locales no usan `RepairButton`

Archivos:

- `src/app/admin/tickets/page.tsx`
- `src/modules/catalog/components/catalog-admin.tsx`
- `src/modules/quotes/components/quote-admin.tsx`
- `src/modules/payments/components/payment-admin.tsx`
- `src/app/admin/messages/page.tsx`

Problema:

- Se repiten clases para botones en cada modulo.

Impacto:

- Estados hover/disabled/focus pueden divergir.

Complejidad: Media.

## 12. Navigation Problems

### 12.1 Admin nav mezcla topbar publica/interna con nav operacional

Archivos:

- `src/components/admin-nav.tsx`
- `src/components/repairlab/index.tsx`

Problema:

- `RepairTopbar` contiene telefono demo, correo local y horario.
- Para admin interno puede ser ruido permanente.

Impacto workshop:

- Ocupa altura vertical y distrae de operaciones.

Complejidad: Media.

### 12.2 Command Palette trigger fijo en mobile puede superponerse

Archivo:

- `src/modules/ux/components/command-palette.tsx`

Problema:

- Boton fijo `bottom-4 right-4 z-40` puede competir con acciones futuras, chat/help o contenido inferior.

Impacto mobile:

- Riesgo de tap accidental y solapamiento.

Complejidad: Baja/Media.

## 13. Top 20 Actual Code-Level Improvements

| Rank | Recommendation | Affected files | Complexity | Expected UX improvement | Expected workshop impact |
| --- | --- | --- | --- | --- | --- |
| 1 | Fix mojibake and Spanish accents across visible UI | `src/components/admin-nav.tsx`, `src/modules/ux/components/command-palette.tsx`, `src/app/admin/**/*.tsx`, `src/modules/**/*.tsx` | Medium | UI immediately feels professional | High trust with staff/customers |
| 2 | Change root `lang` to Spanish and update metadata | `src/app/layout.tsx` | Low | Better accessibility and browser behavior | More professional internal/customer UX |
| 3 | Replace global `!important` Tailwind overrides with explicit dark tokens over time | `src/app/globals.css`, `src/components/repairlab/index.tsx` | Medium/High | More predictable design system | Lower UI regression risk |
| 4 | Create shared form field components | `src/components/repairlab/index.tsx`, intake, quotes, catalog, payments, login, contact | Medium | Consistent inputs, labels, errors | Faster forms, fewer mistakes |
| 5 | Humanize intake enums | `src/modules/intake/components/intake-form.tsx` | Low | Easier for non-technical staff | Faster reception |
| 6 | Convert intake into mobile-first sections/step flow | `src/app/admin/intake/page.tsx`, `src/modules/intake/components/intake-form.tsx` | Medium | Less overwhelming on phone/tablet | Faster device intake |
| 7 | Remove or hide `DemoChecklist` from real dashboard | `src/app/admin/dashboard/page.tsx`, `src/components/admin-nav.tsx` | Low | Dashboard feels operational, not demo | Better daily focus |
| 8 | Rebuild dashboard around operational queue | `src/app/admin/dashboard/page.tsx`, `src/modules/dashboard/dashboard.service.ts` | Medium | Shows what needs action now | Higher throughput |
| 9 | Consolidate ticket status labels into one shared label module | tickets, dashboard, portal, quotes, services | Medium | Consistent language everywhere | Fewer state misunderstandings |
| 10 | Simplify ticket detail hierarchy into a cockpit | `src/app/admin/tickets/[ticketId]/page.tsx`, ticket components | High | Faster comprehension of next action | Major operational gain |
| 11 | De-duplicate timelines in ticket detail | `src/app/admin/tickets/[ticketId]/page.tsx`, `src/modules/ux/components/activity-timeline.tsx`, `src/components/repairlab/ticket-timeline.tsx` | Medium | Less cognitive overload | Faster ticket review |
| 12 | Make ticket next action sticky/primary on desktop and mobile | `src/app/admin/tickets/[ticketId]/page.tsx`, `src/modules/tickets/components/ticket-actions.tsx` | Medium | Clear next step | Fewer stalled repairs |
| 13 | Create mobile card alternatives for wide tables | tickets, quotes, invoice, payments, catalog, portal quote | High | Better mobile usability | Staff can work from phone |
| 14 | Polish portal status language and quote/invoice mobile views | `src/app/track/[token]/page.tsx`, public portal components | Medium | Better customer trust | Fewer status questions |
| 15 | Convert contact form from disabled placeholder to clear safe CTA | `src/app/contact/page.tsx` | Low/Medium | Less confusion for leads | Better acquisition |
| 16 | Reduce admin topbar height/noise | `src/components/admin-nav.tsx`, `src/components/repairlab/index.tsx` | Medium | More content above fold | Faster admin use |
| 17 | Standardize buttons through `RepairButton` variants | components and modules with local button classes | Medium | More consistent hover/focus/disabled | Less visual confusion |
| 18 | Add proper file upload UI for intake photos | `src/modules/intake/components/intake-form.tsx` | Medium | Clearer private photo workflow | Better evidence capture |
| 19 | Improve catalog/inventory language and stock action hierarchy | `src/modules/catalog/components/catalog-admin.tsx`, inventory components | Medium | Clearer stock decisions | Fewer blocked repairs |
| 20 | Review mobile command palette trigger placement | `src/modules/ux/components/command-palette.tsx` | Low | Less overlap on mobile | Better navigation without obstruction |

## 14. Recommended Design Direction

RepairLab should move from "dark premium admin" to "workshop operating system".

Direction:

- Calm black/zinc base.
- Strong hierarchy around next operational action.
- Fewer equal-weight cards.
- Clear status language.
- Mobile-first forms and ticket actions.
- Customer portal simpler than admin.
- Repair cockpit experience for ticket detail.
- Dashboard as daily work queue, not just metrics.

Benchmarks to emulate carefully:

- Linear: clarity and density.
- Stripe Dashboard: calm financial/admin surfaces.
- Shopify Admin: operational workflows.
- Raycast: command speed.
- Apple repair/status: customer portal trust.

Avoid:

- More glow.
- More cards without hierarchy.
- SaaS hero patterns inside daily admin screens.
- Generic dashboard metrics that do not drive workshop action.

## 15. Suggested First Implementation Sprint

Sprint goal: stabilize the visible frontend foundation before more redesign.

1. Fix encoding/localization in visible UI.
2. Change `html lang` to Spanish and update metadata.
3. Replace most obvious light/dark dual classes in shared components.
4. Remove dashboard demo checklist from real dashboard or gate it behind dev/demo mode.
5. Humanize intake select labels.
6. Standardize status labels in one shared module.
7. Create shared `RepairField`, `RepairSelect`, `RepairTextarea`, `RepairSubmitButton`.
8. Apply shared fields to intake first.
9. Audit mobile at 390px, 430px, 1024px, 1280px.
10. Then plan ticket cockpit refactor separately.

## 16. Risks

- The global CSS override layer hides real component defects.
- Ticket detail refactor is high-value but risky because it touches many workflow surfaces.
- Fixing language in UI should include PDFs/email templates later, but this audit focuses frontend.
- Mobile table replacements require careful information design, not just styling.
- Removing topbar/dashboard demo elements should preserve demo/testing docs elsewhere.

## 17. Conclusion

RepairLab already has a serious frontend foundation: dark-first layout, reusable components, admin nav, command palette, notifications, portal components, skeletons, empty states and operational pages.

The biggest blockers to a truly professional workshop-first experience are:

1. Broken Spanish encoding and inconsistent terminology.
2. Over-reliance on global CSS overrides.
3. Dashboard not yet centered enough on daily operational queue.
4. Ticket detail too dense for fast workshop use.
5. Mobile workflows still too desktop-table/form-oriented.

The highest-impact next move is not another broad visual redesign. It is a focused stabilization sprint: language, dark tokens, intake speed, dashboard queue and ticket cockpit hierarchy.
