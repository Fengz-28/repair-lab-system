# RepairLab - Architecture Map

Actualizado: 2026-05-25, America/Costa_Rica.

## Mapa de carpetas

```txt
src/
  app/
    (public routes)
    admin/
    login/
    track/
  components/
    admin-nav.tsx
    repairlab/
  modules/
    catalog/
    customer-portal/
    customers/
    dashboard/
    email/
    intake/
    inventory/
    invoices/
    messages/
    notifications/
    payments/
    pdf/
    quotes/
    receipts/
    tickets/
  server/
    audit/
    auth/
    db/
    integrations/
    storage/
  integrations/
    calendar/
    n8n/
    trello/
    whatsapp/
  ai/
prisma/
  schema.prisma
  migrations/
docs/
scripts/
public/
```

## Capas

```txt
UI / Routes
  src/app/*
  src/components/*
       |
       v
Validation / Auth boundary
  Zod schemas
  requireLocalStaff
       |
       v
Domain modules
  intake, tickets, quotes, invoices, payments, inventory...
       |
       v
Infrastructure
  Prisma, audit, storage, email, pdf, integration events
       |
       v
PostgreSQL
```

## Frontend

- Next.js 16 App Router.
- React 19.
- Tailwind CSS.
- Dark-first global visual identity.
- Public pages:
  - `/`
  - `/services`
  - `/products`
  - `/contact`
  - `/track/[token]`
- Admin pages:
  - `/admin`
  - `/admin/dashboard`
  - `/admin/intake`
  - `/admin/tickets`
  - `/admin/tickets/[ticketId]`
  - `/admin/tickets/[ticketId]/quotes`
  - `/admin/tickets/[ticketId]/invoices/[invoiceId]`
  - `/admin/catalog`
  - `/admin/customers`
  - `/admin/messages`

## Backend

El backend esta integrado en Next.js mediante Server Components, Server Actions y Route Handlers.

Patron general:

```txt
page.tsx / actions.ts
  -> requireLocalStaff()
  -> Zod parse
  -> module service
  -> Prisma transaction
  -> AuditLog / TicketEvent / IntegrationEvent / MessageLog
  -> revalidatePath / redirect
```

## Servicios principales

### Intake

Archivo clave: `src/modules/intake/intake.service.ts`.

Responsabilidades:

- Crear cliente.
- Crear equipo.
- Crear intake.
- Crear ticket.
- Crear historial inicial.
- Preparar archivos privados placeholder.
- Emitir eventos y auditoria.
- Disparar email de ticket recibido si aplica.

### Tickets lifecycle

Archivo clave: `src/modules/tickets/ticket.lifecycle.service.ts`.

Responsabilidades:

- Validar transiciones.
- Actualizar estado.
- Registrar `TicketStatusHistory`.
- Registrar `TicketEvent`.
- Registrar `AuditLog`.
- Emitir `IntegrationEvent`.
- Enviar emails de estado relevantes.

Transiciones observadas:

```txt
RECEIVED
  -> INITIAL_REVIEW
  -> DIAGNOSIS
  -> WAITING_APPROVAL
  -> APPROVED
  -> REPAIR_IN_PROGRESS
  -> READY_FOR_PICKUP
  -> DELIVERED

WAITING_APPROVAL -> CANCELLED
DELIVERED y CANCELLED son finales.
```

### Quotes

Archivo clave: `src/modules/quotes/quote.service.ts`.

Las cotizaciones usan `Invoice` con `type = QUOTE`.

```txt
DRAFT -> SENT -> APPROVED
              -> REJECTED
              -> EXPIRED
```

Efecto sobre ticket:

```txt
Quote SENT      -> Ticket WAITING_APPROVAL
Quote APPROVED  -> Ticket APPROVED
Quote REJECTED  -> Ticket DIAGNOSIS
Quote EXPIRED   -> Ticket DIAGNOSIS
```

### Invoices

Archivo clave: `src/modules/invoices/invoice.service.ts`.

Responsabilidades:

- Convertir quote aprobada en factura interna.
- Copiar lineas/totales.
- Mantener quote como historial.
- Evitar duplicado.
- Emitir eventos y auditoria.

### Payments

Archivo clave: `src/modules/payments/payment.service.ts`.

Responsabilidades:

- Registrar pagos manuales.
- Calcular saldo.
- Actualizar `paymentStatus`.
- Emitir eventos.
- Descontar inventario cuando la factura queda pagada.

### Inventory

Archivo clave: `src/modules/inventory/inventory.service.ts`.

Responsabilidades:

- Crear/actualizar items de inventario asociados a `CatalogItem`.
- Movimientos manuales.
- Validar stock suficiente.
- Registrar movimientos por factura pagada.

### Customer portal

Archivo clave: `src/modules/customer-portal/tracking.service.ts`.

Responsabilidades:

- Resolver ticket por token.
- Construir vista publica segura.
- Filtrar timeline publico.
- Verificar acceso publico a PDFs.

### Email

Archivo clave: `src/modules/email/email.service.ts`.

Responsabilidades:

- Crear `MessageLog`.
- Renderizar templates.
- Enviar por provider `console`, `disabled` o `resend`.
- Marcar estado y error.
- Emitir `IntegrationEvent`.

## Modelo de datos resumido

```txt
Customer 1--* Device
Customer 1--* Ticket
Customer 1--* Invoice

Device 1--* Ticket
Intake 1--1 Ticket

Ticket 1--* TicketStatusHistory
Ticket 1--* TicketEvent
Ticket 1--* TicketComment
Ticket 1--* Invoice
Ticket 1--* MessageLog
Ticket 1--* FileAsset

Invoice 1--* InvoiceItem
Invoice 1--* Payment

CatalogItem 1--0..1 InventoryItem
CatalogItem 1--* InvoiceItem
InventoryItem 1--* InventoryMovement

User 1--* AuditLog
```

## Auditoria de base de datos

### Tablas de identidad y acceso

- `User`: usuarios internos; contiene hash de password, rol y estado activo.
- `AuditLog`: registro de acciones administrativas relevantes.

Observaciones:

- No se observo tabla de sesiones persistidas; la sesion vive en cookie firmada.
- No se observo tabla de intentos fallidos de login.

### Tablas operativas core

- `Customer`: cliente.
- `Device`: equipo del cliente.
- `Intake`: recepcion de equipo.
- `Ticket`: caso de reparacion.
- `TicketStatusHistory`: historial formal de estados.
- `TicketComment`: comentarios internos o notas.
- `TicketEvent`: timeline/eventos humanos y de sistema.

Observaciones:

- `Customer` no tiene deduplicacion fuerte por email/telefono; existen indices, no unique constraints.
- `Device.serial` esta indexado, pero no es unico. Esto es correcto si serial puede repetirse por error operativo, pero debe considerarse en busqueda.
- `Ticket.publicAccessToken` si es unico y obligatorio.

### Tablas comerciales

- `CatalogItem`: servicio/producto/repuesto.
- `Invoice`: cotizacion, factura interna o recibo segun `type`.
- `InvoiceItem`: lineas comerciales.
- `Payment`: pagos manuales.

Observaciones:

- `Invoice` concentra varios conceptos. Es util para velocidad, pero requiere reglas por tipo.
- Falta relacion explicita `sourceQuoteId` para facturas generadas desde cotizacion.
- Hay indices para customer/ticket/status, pero faltan indices compuestos optimizados para dashboards por `type`, `paymentStatus` y fechas.

### Tablas de inventario

- `InventoryItem`: stock asociado 1:1 a `CatalogItem`.
- `InventoryMovement`: movimientos de entrada/salida/ajuste.

Observaciones:

- El tracking es opcional y flexible.
- La validacion de stock ocurre en aplicacion.
- No se observo bloqueo pesimista o estrategia explicita para concurrencia de stock.

### Tablas de comunicacion e integraciones

- `MessageLog`: historial de mensajes/email.
- `IntegrationEvent`: outbox placeholder para automatizaciones.
- `WebhookEndpoint`: configuracion futura de webhooks.

Observaciones:

- `MessageLog` esta operativo para email.
- `IntegrationEvent` se escribe, pero no se procesa por worker versionado.
- `WebhookEndpoint` existe como base, no como funcionalidad conectada.

### Tablas de archivos

- `FileAsset`: metadata de archivos privados.

Observaciones:

- Guarda metadata y relaciones a intake/ticket.
- El binario local se guarda bajo `PRIVATE_STORAGE_ROOT` y se resuelve mediante `storageKey`.
- La ruta admin `/admin/files/[fileAssetId]` valida sesion y sirve el archivo desde storage privado.
- `ownerType/ownerId` da flexibilidad pero no integridad referencial.

### Tablas IA/RAG

- `KnowledgeDocument`
- `KnowledgeChunk`
- `AIInteraction`

Observaciones:

- `KnowledgeChunk.embedding` usa `Unsupported("vector")?`.
- La migracion crea extension `vector`.
- No hay flujo RAG funcional observado.

## Indices observados y gaps

Indices existentes relevantes:

- `Ticket(status)`
- `Ticket(createdAt)`
- `TicketEvent(ticketId, createdAt)`
- `Invoice(customerId)`
- `Invoice(ticketId)`
- `Invoice(status)`
- `Payment(invoiceId)`
- `Payment(method)`
- `Payment(createdAt)`
- `MessageLog(customerId)`
- `MessageLog(ticketId)`
- `MessageLog(channel, status)`
- `InventoryMovement(inventoryItemId, createdAt)`
- `IntegrationEvent(type, status)`
- `IntegrationEvent(aggregateType, aggregateId)`

Indices recomendables cuando el volumen crezca:

- `Invoice(type, status, createdAt)`
- `Invoice(type, paymentStatus, createdAt)`
- `Ticket(status, createdAt)`
- `MessageLog(status, createdAt)`
- `MessageLog(ticketId, createdAt)`
- `Customer(lastName, firstName)` si se hacen busquedas ordenadas.
- Indices trigram/full-text si la busqueda libre crece.

## Enums criticos

- `UserRole`: `ADMIN`, `TECHNICIAN`, `RECEPTIONIST`.
- `TicketStatus`: `RECEIVED`, `INITIAL_REVIEW`, `DIAGNOSIS`, `WAITING_APPROVAL`, `APPROVED`, `REPAIR_IN_PROGRESS`, `READY_FOR_PICKUP`, `DELIVERED`, `CANCELLED`.
- `InvoiceType`: `QUOTE`, `INVOICE`, `RECEIPT`.
- `InvoiceStatus`: `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `EXPIRED`, `ISSUED`, `PAID`, `PARTIALLY_PAID`, `VOID`, `CANCELLED`.
- `PaymentStatus`: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`, `VOID`.
- `ProductType`: `SERVICE`, `PRODUCT`, `PART`.
- `InventoryMovementType`: `IN`, `OUT`, `ADJUSTMENT`.
- `MessageStatus`: `DRAFT`, `QUEUED`, `SENT`, `DELIVERED`, `FAILED`, `CANCELLED`.

## Eventos

Eventos persistidos:

- `TicketEvent`: timeline operativo.
- `IntegrationEvent`: outbox/futuras integraciones.
- `AuditLog`: trazabilidad administrativa.
- `MessageLog`: historial de comunicaciones.

Ejemplos de eventos:

- `ticket.created`
- `ticket.status_changed`
- `quote.created`
- `quote.sent`
- `quote.approved`
- `invoice.created`
- `payment.registered`
- `inventory.adjusted`
- `email.sent`
- `email.failed`

## Infraestructura operativa minima

- Scripts:
  - `scripts/backup-db.mjs`
  - `scripts/backup-storage.mjs`
  - `scripts/backup.mjs`
  - `scripts/process-integration-events.mjs`
- Endpoint:
  - `/api/health`

```txt
npm run backup
  -> backup PostgreSQL en backups/postgres
  -> backup storage privado en backups/storage

GET /api/health
  -> DB SELECT 1
  -> storage read/write check
  -> JSON sin secretos

npm run worker:events
  -> busca IntegrationEvent pendientes/reintentables
  -> claim atomico a PROCESSING
  -> handler local por tipo
  -> PROCESSED / FAILED / CANCELLED
```

## Outbox local inicial

`IntegrationEvent` funciona como outbox persistente en PostgreSQL. Los flujos principales escriben datos de negocio y eventos en la misma transaccion cuando aplica. El worker local `npm run worker:events` procesa batches separados del request principal.

Estados:

- `PENDING`: listo para procesar cuando `availableAt <= now`.
- `PROCESSING`: reclamado por un worker.
- `PROCESSED`: handler completado.
- `FAILED`: fallo reintentable con `attempts` y nuevo `availableAt`.
- `CANCELLED`: evento no soportado o payload no procesable.

Eventos actuales:

- Los eventos de dominio (`ticket.*`, `quote.*`, `invoice.*`, `inventory.*`, `product.*`, `service.*`, `receipt.created`) se procesan como no-op local seguro para dejar preparado el relay futuro.
- `notification.email.placeholder_created`, `notification.email.sent` y `notification.email.failed` se validan/procesan sin reenviar emails.
- `notification.email.requested` queda reservado para migrar email al outbox; hoy falla con retry para evitar envios accidentales.

## Flujo funcional completo

```txt
1. Staff inicia sesion en /login.
2. Recepcionista abre /admin/intake.
3. Registra cliente, equipo, accesorios, condicion, problema y fotos placeholder.
4. Sistema crea Customer, Device, Intake y Ticket.
5. Ticket aparece en /admin/tickets y /admin/dashboard.
6. Tecnico mueve ticket a revision/diagnostico.
7. Tecnico registra diagnostico y crea cotizacion.
8. Cotizacion recibe lineas de servicio/producto/parte.
9. Cotizacion se envia: ticket queda WAITING_APPROVAL.
10. Cliente consulta /track/[token] y recibe email si existe correo.
11. Staff marca quote APPROVED o REJECTED.
12. Si APPROVED, ticket avanza a estado operativo de reparacion.
13. Staff genera factura interna desde la quote.
14. Staff registra pagos manuales.
15. Si factura queda PAID, inventario controlado se descuenta.
16. Tecnico marca reparacion lista y luego entregada.
17. Timeline, auditoria, mensajes, PDFs y portal quedan como historial.
```
