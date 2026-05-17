# Arquitectura

## Objetivo

Sistema self-hosted tipo RepairFlow para un negocio de reparacion electronica. Debe correr localmente con Docker, PostgreSQL, Next.js, Prisma, n8n y Ollama, y poder migrarse luego a VPS, servidor dedicado o nube sin reescribir el nucleo.

## Principios

- PostgreSQL es la fuente de verdad.
- n8n automatiza, consume webhooks y escucha eventos; no guarda el estado principal.
- Las integraciones se conectan por interfaces y adapters intercambiables.
- La UI no debe importar Prisma directamente.
- Toda mutacion critica debe dejar auditoria y, cuando aplique, evento de integracion.
- Las fotos de recepcion son privadas por defecto.
- La IA local asiste al staff; no toma decisiones criticas automaticamente.

## Capas

```txt
src/app/             Rutas publicas y administrativas de Next.js.
src/components/      Componentes UI reutilizables.
src/modules/         Dominio y casos de uso por capacidad.
src/server/          Infraestructura server-side: db, auth, audit, events, storage.
src/services/        Orquestacion de casos de uso transversales.
src/integrations/    Adapters para proveedores externos.
src/ai/              Contratos IA, RAG y knowledge base.
src/emails/          Email provider y templates.
src/lib/             Utilidades puras.
prisma/              Schema, migraciones y seeds.
docs/                Arquitectura, seguridad, roadmap y decisiones.
```

## Modulos previstos

| Modulo | Responsabilidad |
| --- | --- |
| customers | Clientes y preferencias de contacto |
| devices | Equipos, marcas, modelos, seriales y accesorios |
| intake | Recepcion, condicion fisica, problema reportado y fotos privadas |
| tickets | Estados, historial, comentarios y timeline |
| appointments | Citas, disponibilidad y sincronizacion futura |
| catalog | Servicios y productos |
| inventory | Stock basico y movimientos |
| billing | Cotizaciones, invoices y estados de pago |
| communications | Canales, mensajes y logs |
| crm | Dashboard, metricas y actividad reciente |
| audit | Auditoria transversal |

## Flujo critico de recepcion

1. Registrar o seleccionar cliente.
2. Registrar equipo con tipo, marca, modelo y serial.
3. Registrar accesorios, condicion fisica, problema reportado y observaciones internas.
4. Guardar multiples fotos privadas como `FileAsset`.
5. Crear `Ticket` automaticamente en estado `RECEIVED`.
6. Crear `TicketStatusHistory`, `TicketEvent` y `AuditLog`.
7. Crear comprobante o invoice placeholder.
8. Emitir `IntegrationEvent` `ticket.created` para email, WhatsApp o n8n futuro.

## Eventos internos

Eventos iniciales:

- `ticket.created`
- `ticket.updated`
- `ticket.status_changed`
- `appointment.created`
- `invoice.created`
- `quote.sent`

Los eventos deben guardarse en PostgreSQL con estado, intentos, error e idempotencia. Un worker o n8n podra consumirlos despues.

## Integraciones futuras

Cada integracion debe tener:

- interface local estable,
- provider deshabilitado por defecto,
- variables en `.env`,
- validacion de inputs,
- idempotencia,
- logs y auditoria cuando afecte negocio.

Proveedores previstos:

- SMTP provider.
- WhatsApp Business Cloud API provider.
- Google Calendar provider.
- Ollama provider.
- RAG provider.
- Storage provider.
- n8n provider.
- Trello provider opcional.

## Storage privado

No usar `public/` para fotos de recepcion. La estrategia inicial debe ser filesystem privado local fuera de `public/`; mas adelante se puede mover a MinIO, S3, R2 o equivalente usando el mismo `StorageProvider`.

## IA y RAG

pgvector ya esta preparado por Docker. Prisma modela embeddings como `Unsupported("vector")`. La IA se incorporara despues para resumen de tickets, respuestas sugeridas, busqueda semantica y knowledge base.

## Decisiones aplazadas

- Auth final.
- Worker/cola final para eventos.
- Storage definitivo.
- SMTP real.
- WhatsApp API real.
- Calendar API real.
- Deployment productivo.

