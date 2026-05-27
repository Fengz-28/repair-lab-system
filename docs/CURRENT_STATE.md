# RepairLab - Current State

Actualizado: 2026-05-25, America/Costa_Rica.

## Estado general del proyecto

RepairLab tiene una base funcional amplia y modular. Ya no es solo una maqueta: existe flujo operativo interno, persistencia real en PostgreSQL, validacion Zod en acciones principales, autenticacion admin basica, eventos, auditoria, PDFs y portal publico.

El proyecto sigue siendo pre-produccion. Hay varios puntos pensados correctamente pero aun incompletos: storage cloud/backup de archivos, integraciones externas, workers, backups, CI/CD, observabilidad y hardening de seguridad.

## Funcionalidades terminadas o usables

### Public web

- `/`: landing publica RepairLab con identidad visual dark-first.
- `/services`: servicios publicos.
- `/products`: catalogo visual placeholder sin ecommerce.
- `/contact`: contacto visual; no se observo envio funcional de formulario.
- Navegacion publica separada del admin.

### Autenticacion admin

- `/login`: formulario admin.
- Logout implementado.
- Sesion firmada con HMAC en cookie `httpOnly`.
- `sameSite=lax`; `secure` en produccion.
- Roles: `ADMIN`, `TECHNICIAN`, `RECEPTIONIST`.
- Middleware redirige `/admin/*` a login si no ve cookie.
- Seguridad real ocurre en server-side con `requireLocalStaff`.

### Intake / recepcion

- `/admin/intake` permite registrar cliente, equipo, problema, condicion, accesorios, notas y archivos privados locales.
- Crea `Customer`, `Device`, `Intake` y `Ticket` en una transaccion.
- Genera `ticketNumber`, `receiptNumber` y `publicAccessToken`.
- Crea `TicketStatusHistory`, `TicketEvent`, `IntegrationEvent`, `AuditLog` y email transaccional si hay email.

### Tickets

- `/admin/tickets`: listado con busqueda, filtros, cards/tabla, indicadores financieros y acciones.
- `/admin/tickets/[ticketId]`: detalle premium con estado, timeline, cliente, equipo, notas, cotizaciones, factura, portal cliente, mensajes y acciones.
- Transiciones validas de estados.
- Historial de cambios con `TicketStatusHistory`.
- Timeline con `TicketEvent`.
- Comentarios internos y notas tecnicas.

### Cotizaciones

- `/admin/tickets/[ticketId]/quotes`.
- Se modelan como `Invoice` con `type = QUOTE`.
- Soportan estados `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `EXPIRED`.
- Validan que no se envie/apruebe quote vacia o con total <= 0.
- Lineas `SERVICE`, `PRODUCT`, `PART`.
- Integracion con ticket:
  - quote `SENT` mueve ticket a `WAITING_APPROVAL`.
  - quote `APPROVED` mueve ticket a `APPROVED`.
  - quote `REJECTED` o `EXPIRED` vuelve a `DIAGNOSIS` cuando corresponde.
- PDF de cotizacion disponible.
- Emails de quote lista/aprobada si el cliente tiene email.

### Facturas internas

- Facturas internas como `Invoice` con `type = INVOICE`.
- Conversion desde quote aprobada.
- Copia lineas, subtotal y total.
- Evita duplicado usando una marca textual en `internalNotes` (`sourceQuoteId:<id>`).
- Vista de factura en `/admin/tickets/[ticketId]/invoices/[invoiceId]`.
- PDF de factura.

### Pagos manuales

- Registro manual de pago sobre factura.
- Metodos: `CASH`, `CARD`, `TRANSFER`, `SINPE`, `OTHER`.
- Calcula total pagado, saldo y `paymentStatus`.
- Bloquea pago mayor al saldo.
- Si la factura queda pagada, intenta descontar inventario aplicable.

### Inventario

- `/admin/catalog` con visual premium.
- `CatalogItem` soporta catalogo de servicios/productos/partes.
- Tracking de inventario opcional por `InventoryItem`.
- Movimientos `IN`, `OUT`, `ADJUSTMENT`.
- Descuento automatico al completar pago de factura para items `PRODUCT` o `PART` con inventario controlado.
- No obliga a controlar stock para operar.

### Dashboard

- `/admin/dashboard` con KPIs de tickets, cotizaciones, facturas, pagos e inventario.
- Listas operativas: tickets que requieren atencion, quotes pendientes, facturas por cobrar, stock bajo, eventos recientes.

### CRM

- `/admin/customers`: listado CRM.
- `/admin/customers/[customerId]`: detalle de cliente, equipos, tickets, actividad y resumen financiero.

### Portal cliente

- `/track/[token]` muestra estado publico de reparacion.
- No expone admin, notas internas, inventario ni audit logs.
- PDFs publicos:
  - `/track/[token]/quote.pdf`
  - `/track/[token]/invoice.pdf`
- El acceso se basa en `Ticket.publicAccessToken`.

### Mensajes / emails

- `/admin/messages`.
- `/admin/messages/[messageId]`.
- Se registra `MessageLog` para emails generados.
- Providers: `console`, `disabled`, `resend`.
- Los errores de email no bloquean el flujo principal.

## Parcialmente implementado

- Uploads/fotos: storage local privado implementado para intake/tickets. Pendiente storage cloud/S3, antivirus y politicas avanzadas de retencion.
- Email: funcional basico, sin cola, retries avanzados, SMTP ni plantillas externas.
- Integration events: se escriben en DB, pero no existe worker real que procese eventos.
- Webhooks: modelo `WebhookEndpoint` existe; no se observo flujo real con firma/idempotencia.
- Appointments/calendario: modelo existe; no se observo UI/servicio operacional completo.
- IA/RAG: schema y providers placeholder; no hay RAG funcional ni llamadas Ollama activas.
- Public products/contact: visuales, sin backend comercial o contacto real.
- Quote approval token: existe `approvalToken`, pero no aprobacion publica online.
- Seguridad: auth inicial bien encaminada, pero faltan controles productivos.

## Planeado o no implementado

- WhatsApp Business Cloud API.
- Google Calendar real.
- n8n workflows reales.
- Trello real.
- Ollama/RAG funcional.
- Ecommerce/carrito/checkout.
- Pasarelas de pago.
- Facturacion fiscal oficial.
- Cliente con cuenta/login.
- Multi-tenant.
- Deployment productivo versionado.
- Backups automatizados.
- CI/CD.
- Observabilidad centralizada.

## Placeholders y mocks relevantes

- `src/integrations/whatsapp/whatsapp.provider.ts`: disabled placeholder.
- `src/integrations/calendar/calendar.provider.ts`: disabled placeholder.
- `src/integrations/n8n/n8n.provider.ts`: disabled placeholder.
- `src/integrations/trello/trello.provider.ts`: disabled placeholder.
- `src/ai/ai.provider.ts`: disabled provider.
- `src/server/storage/private-storage.ts`: provider local privado para binarios.
- `src/modules/receipts/receipt.service.ts`: comprobante/receipt placeholder.
- `src/modules/notifications/notification.service.ts`: capa placeholder historica; email real inicial vive en `src/modules/email`.
- `/products` y `/contact`: paginas publicas sin ecommerce/envio real.

## Posibles features rotas o riesgosas

- Estado aplicado de migraciones desconocido sin ejecutar `prisma migrate status` contra la DB.
- `structure.txt` aparece no trackeado y pesa mucho como artefacto generado; no parece parte de runtime.
- `package.json` tenia `bcryptjs` duplicado en `dependencies`; fue corregido en el saneamiento local del 2026-05-25.
- Conversion quote -> invoice depende de buscar texto en `internalNotes`, no de una relacion normalizada.
- Inventario se descuenta al quedar factura pagada; hay validaciones, pero no se observo bloqueo de concurrencia fuerte para pagos simultaneos.
- Emails externos se disparan dentro del flujo de servicio; aunque los errores se capturan, en produccion conviene sacar esto a cola/outbox worker.
- Middleware no valida firma de cookie; solo redirige por presencia de cookie. La seguridad real depende de checks server-side, que deben mantenerse en toda ruta/action.

## Working tree observado

`git status --short` reporto cambios no commiteados en:

- `prisma/schema.prisma`
- `scripts/seed-admin.mjs`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `structure.txt` no trackeado

La auditoria documenta el estado del working tree actual, no necesariamente el ultimo commit limpio.

## Verificacion tecnica local - 2026-05-25

Resultado de salud local:

- `npx prisma validate`: aprobado.
- `npx prisma generate`: aprobado.
- `npm run lint`: aprobado.
- `npx tsc --noEmit`: aprobado.
- `npx prisma migrate status`: bloqueado por entorno local; Docker Desktop/PostgreSQL no estaba accesible.

Detalle:

- `migrate status` inicialmente no pudo obtener el engine dentro del sandbox por restriccion de red.
- Ejecutado fuera del sandbox, Prisma cargo el datasource `repairlab` en `localhost:5432`, pero termino con `Schema engine error`.
- Una lectura directa con Prisma Client fallo con `ECONNREFUSED`.
- `docker ps` fallo porque Docker Desktop no estaba corriendo o no exponia `dockerDesktopLinuxEngine`.

Conclusion:

- El schema Prisma y el cliente generado estan sanos.
- No se pudo confirmar el estado aplicado de migraciones porque la base local no estaba disponible.
- Antes de nuevas migraciones o hardening con DB, iniciar Docker Desktop/PostgreSQL y repetir `npx prisma migrate status`.

## Saneamiento local minimo - 2026-05-25

Resultado actualizado:

- Docker Desktop accesible fuera del sandbox.
- `repair_lab_postgres` activo y exponiendo `localhost:5432`.
- `docker compose up -d postgres`: OK.
- `npx prisma migrate status`: OK, 9 migraciones encontradas y DB al dia.
- `npx prisma validate`: OK.
- `npx prisma generate`: OK.
- `npm run seed:admin`: OK. El script requiere `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; `ADMIN_PASSWORD` debe tener minimo 10 caracteres; `ADMIN_NAME` usa fallback si falta.
- `npm run lint`: OK.
- `npx tsc --noEmit`: OK.

Prueba funcional:

- Login admin probado en navegador local: OK.
- El dev server Next entro luego en estado inconsistente: habia proceso Node del proyecto, pero no habia puerto 3000/3001 escuchando y las peticiones HTTP quedaron en timeout.
- Por esa razon no se completo prueba navegador end-to-end de intake -> ticket -> quote -> invoice -> payment -> portal -> PDF.

Limpieza:

- `package.json` tenia `bcryptjs` duplicado en `dependencies`; se elimino el duplicado sin cambiar version.
- `npm install` quedo `up to date`.
- `npm install` reporto 5 vulnerabilidades moderadas; no se ejecuto `npm audit fix --force` para evitar cambios mayores no revisados.
- `structure.txt` es un listado generado de rutas que incluye `.env`, `.next`, `node_modules` y otros artefactos; no es necesario para runtime. Recomendado eliminarlo o ignorarlo tras confirmacion.

## Hardening minimo - rate limiting y login - 2026-05-25

Implementado:

- Rate limiting server-side para login admin.
- Rate limiting server-side para portal publico `/track/[token]`.
- Rate limiting server-side para PDFs publicos:
  - `/track/[token]/quote.pdf`
  - `/track/[token]/invoice.pdf`
- Identificacion central de cliente por `x-forwarded-for`, `x-real-ip` y fallback `unknown`.
- Registro de intentos de login en `AuditLog` con email intentado, IP, user agent, resultado y motivo. No se guarda password.

Limitaciones:

- El storage del rate limit es in-memory. Se reinicia al reiniciar el proceso y no sirve para multiples instancias.
- Para produccion multi-instancia se debe migrar a Redis, Upstash o un store compartido.
- Los PDFs publicos devuelven `429` con `Retry-After`.
- La pagina `/track/[token]` es Server Component; se bloquea con pantalla segura, pero no fija status HTTP `429` sin reestructurar la ruta.

## Storage privado local - 2026-05-25

Implementado:

- Provider local privado basado en `PRIVATE_STORAGE_ROOT`.
- Guardado binario real para archivos de recepcion/intake.
- Guardado binario real para adjuntos internos de ticket.
- Ruta admin protegida `/admin/files/[fileAssetId]` para abrir/descargar archivos.
- Validacion de tamano, cantidad, MIME type y extension.
- Archivos resueltos por `FileAsset.id`; no se aceptan paths libres por query param.
- `storageKey` se resuelve server-side y rechaza rutas absolutas o traversal.

No implementado:

- S3/MinIO/cloud storage.
- Exposicion de archivos al portal cliente.
- Antivirus o analisis de contenido.
- Retencion/lifecycle automatico.

Limitacion:

- Si se migra a multiples instancias o servidor separado, `./storage/private` debe convertirse en volumen persistente compartido o migrarse a S3/MinIO.
