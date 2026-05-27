# RepairLab - System Overview

Actualizado: 2026-05-25, America/Costa_Rica.

Este documento resume el estado real observado del proyecto RepairLab para onboarding de un Senior Engineer o de otro agente IA. No describe aspiraciones como implementadas: separa lo que existe en codigo, lo parcial y lo planeado.

## Resumen ejecutivo

RepairLab es una aplicacion self-hosted para gestion de reparaciones electronicas construida con Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma y PostgreSQL. El proyecto ya evoluciono de una base modular a un sistema operativo interno bastante completo: recepcion de equipos, tickets, ciclo de vida, cotizaciones, facturas internas, pagos manuales, inventario flexible, dashboard, CRM, PDFs, portal publico por token, emails transaccionales basicos y autenticacion admin con roles.

La fuente de verdad es PostgreSQL. Las integraciones externas siguen el principio correcto: no poseen estado principal del negocio. En el codigo existen placeholders/adapters para WhatsApp, Google Calendar, n8n, Trello, IA/Ollama y storage privado, pero no estan conectados como integraciones productivas. El proveedor de email si tiene implementacion inicial: `console`, `disabled` y `resend`, con `MessageLog` y `IntegrationEvent`. Existe un worker outbox local inicial para procesar `IntegrationEvent`, pero aun no hay scheduler externo, cola distribuida, retries productivos ni SMTP real.

La arquitectura general esta separada en rutas App Router bajo `src/app`, componentes UI bajo `src/components`, modulos de dominio bajo `src/modules`, infraestructura server-side bajo `src/server`, integraciones bajo `src/integrations`, IA bajo `src/ai`, Prisma bajo `prisma` y documentacion bajo `docs`. La UI fue migrada a una identidad visual dark-first premium, con componentes reutilizables en `src/components/repairlab`.

El flujo funcional implementado cubre:

```txt
Recepcion
  -> Ticket
  -> Revision inicial / Diagnostico
  -> Cotizacion
  -> Envio / aprobacion / rechazo
  -> Reparacion
  -> Factura interna
  -> Pago manual
  -> Descuento de inventario si aplica
  -> Entrega / cierre
  -> Portal cliente / PDFs / emails
```

La seguridad admin ya no esta abierta: existe `/login`, sesion firmada en cookie `httpOnly`, middleware para redireccion visual de `/admin/*` y validacion server-side con `requireLocalStaff`. Los roles actuales son `ADMIN`, `TECHNICIAN` y `RECEPTIONIST`. El portal cliente `/track/[token]` permanece publico y aislado mediante token no adivinable por ticket.

El estado de produccion todavia no es listo. Los principales riesgos son: rate limiting in-memory, ausencia de CSRF explicito para mutaciones, no hay backups externos/observabilidad/CI, no hay contenedor Docker para la app Next, no hay reverse proxy/TLS versionado, no hay scheduler productivo para el outbox, el storage privado es local y algunas relaciones futuras se resuelven con convenciones en texto en vez de FK explicitas.

Infraestructura real versionada: solo `docker-compose.yml` con PostgreSQL `pgvector/pgvector:pg17`. n8n, Ollama y ngrok no estan orquestados por el repo. El proyecto esta preparado para moverse a VPS o nube, pero necesita hardening operativo antes: Dockerfile/app service, variables separadas por ambiente, migraciones controladas, backups, monitoreo, secrets management y configuracion de dominio/TLS.

## Arquitectura de alto nivel

```txt
Browser / Cliente
   |
   | HTTP
   v
Next.js 16 App Router
   |
   +-- Public web: /, /services, /products, /contact
   +-- Public tracking: /track/[token]
   +-- Admin: /admin/*
   |
   +-- Server Components / Server Actions / Route Handlers
          |
          +-- Zod validation
          +-- Auth / role checks
          +-- Domain services in src/modules/*
                 |
                 +-- Prisma Client
                 |      |
                 |      v
                 |   PostgreSQL + pgvector
                 |
                 +-- AuditLog
                 +-- TicketEvent
                 +-- IntegrationEvent
                 +-- MessageLog
                 +-- PDF generation
                 +-- Email provider
```

## Estado por subsistema

| Subsistema | Estado | Nota |
| --- | --- | --- |
| Web publica | Implementado | Landing, servicios, productos placeholder y contacto visual. No ecommerce real. |
| Admin auth | Implementado inicial | Login, logout, cookie firmada, roles basicos. Falta hardening completo. |
| Intake | Implementado | Crea cliente, equipo, intake, ticket, eventos y email si aplica. |
| Tickets | Implementado | Estados, transiciones, historial, comentarios, notas tecnicas y timeline. |
| Cotizaciones | Implementado | Usa `Invoice(type=QUOTE)`, lineas, totales, estados y reglas. |
| Facturas internas | Implementado | Conversion desde quote aprobada, vista y PDF. No factura fiscal. |
| Pagos manuales | Implementado | Pagos, saldo, estado de pago y eventos. Sin pasarela. |
| Inventario | Implementado basico | Tracking opcional, movimientos, descuento al pagar factura. Sin compras/proveedores. |
| Dashboard | Implementado | KPIs operativos y financieros. Sin graficas avanzadas. |
| CRM clientes | Implementado | Listado, detalle, historial, equipos y finanzas. |
| PDFs | Implementado | Cotizacion y factura internas con `pdf-lib`. No fiscal/legal. |
| Portal cliente | Implementado | Seguimiento por token y PDFs publicos seguros. Sin login cliente. |
| Emails | Parcial funcional | Console/disabled/resend. El worker reconoce outcomes de email sin reenviar. Sin cola distribuida ni SMTP real. |
| Mensajes | Implementado | Historial admin de `MessageLog`. |
| Uploads/fotos | Implementado local | Storage privado local protegido por admin. Falta S3/MinIO, antivirus y retencion. |
| IA/RAG | Planeado | Tablas y providers placeholder. No IA funcional. |
| WhatsApp | Planeado | Adapter deshabilitado. |
| Google Calendar | Planeado | Adapter deshabilitado. |
| n8n | Planeado | Eventos existen y worker local inicial procesa outbox. No hay webhook real versionado. |
| Trello | Planeado opcional | Adapter deshabilitado. |
| Deployment productivo | No implementado | Solo Postgres en Docker. |

## Archivos clave

- `package.json`: scripts y dependencias principales.
- `next.config.ts`: configura Turbopack `root: process.cwd()` por problema de root en Windows.
- `middleware.ts`: redireccion basica de `/admin/*` a `/login`.
- `prisma/schema.prisma`: modelo de datos completo.
- `docker-compose.yml`: PostgreSQL con pgvector.
- `.env.example`: contrato de variables de entorno.
- `src/server/db/prisma.ts`: Prisma Client con adapter PostgreSQL.
- `src/server/auth/local-admin.ts`: sesion admin local, roles y helpers.
- `src/modules/intake/intake.service.ts`: recepcion.
- `src/modules/tickets/ticket.lifecycle.service.ts`: ciclo de vida.
- `src/modules/quotes/quote.service.ts`: cotizaciones.
- `src/modules/invoices/invoice.service.ts`: facturas internas.
- `src/modules/payments/payment.service.ts`: pagos manuales.
- `src/modules/inventory/inventory.service.ts`: inventario.
- `src/modules/customer-portal/tracking.service.ts`: portal cliente.
- `src/modules/email/email.service.ts`: envio transaccional.
- `src/modules/pdf/*`: generacion PDF.

## Advertencia de auditoria

La auditoria reviso archivos y migraciones en disco. No se ejecuto `prisma migrate status` contra una base real, por lo que el estado aplicado de migraciones en la DB local debe verificarse antes de tocar datos. El working tree observado tenia cambios sin commitear en `prisma/schema.prisma`, `scripts/seed-admin.mjs`, `src/app/globals.css`, `src/app/layout.tsx` y un archivo no trackeado `structure.txt`.
