# Roadmap

## Fase 0: Fundacion

- Documentar arquitectura, seguridad y reglas para agentes.
- Definir `.env.example`.
- Ampliar `schema.prisma` como MVP extensible.
- Crear estructura modular de carpetas.
- Crear interfaces placeholder para email, WhatsApp, Calendar, n8n, storage, IA y Trello opcional.

## Fase 1: Base local

- Confirmar Docker Compose con PostgreSQL y pgvector.
- Crear migracion Prisma nueva para el schema fundacional.
- Crear cliente Prisma server-side.
- Agregar Zod para validacion.
- Definir guards minimos para `admin` y `staff`.

## Fase 2: Recepcion y tickets

- Implementar recepcion de equipos.
- Guardar fotos en storage privado.
- Crear ticket automatico.
- Registrar historial de estado, evento y auditoria.
- Generar comprobante inicial.

## Fase 3: CRM administrativo

- CRUD de clientes, equipos, tickets y citas.
- Dashboard con tickets abiertos, tickets por estado, actividad reciente y clientes recurrentes.
- Busqueda por cliente, telefono, serial y numero de ticket.

## Fase 4: Catalogo, inventario y billing

- Catalogo de servicios/productos.
- Inventario basico.
- Cotizaciones e invoices.
- Aprobacion/rechazo de cotizaciones.
- Estado de pago sin pasarela.

## Fase 5: Comunicaciones

- Email provider real.
- Templates.
- Logs por canal.
- WhatsApp manual con `wa.me`.
- Preparacion para WhatsApp Business Cloud API.

## Fase 6: Reservas y calendario

- Citas y disponibilidad.
- Estados de cita.
- Google Calendar provider con sincronizacion idempotente.

## Fase 7: n8n

- Webhooks firmados.
- Eventos de integracion con reintentos.
- Flujos para tickets, citas, cotizaciones e invoices.
- n8n consume eventos; no escribe estado critico directamente.

## Fase 8: IA local y RAG

- Ollama provider.
- Knowledge base.
- Embeddings con pgvector.
- Resumen de tickets.
- Respuestas sugeridas revisadas por staff.

## Fase 9: Produccion self-hosted

- Docker Compose productivo.
- Reverse proxy con TLS.
- Backups de PostgreSQL.
- Backups de storage privado.
- Rotacion de secretos.
- Hardening de n8n y Ollama.

## Riesgos tecnicos futuros

- Acoplar UI con Prisma directamente complica permisos, auditoria y tests.
- Guardar fotos en `public/` expone informacion privada.
- Permitir que n8n sea fuente de verdad crea inconsistencias.
- No modelar historial de estados desde el inicio rompe trazabilidad.
- No registrar eventos impide reintentos e idempotencia.
- No separar providers hace caro cambiar SMTP, WhatsApp, Calendar o storage.
- Usar IA para decisiones automaticas crea riesgo operativo.

## Como evitar deuda tecnica

- Implementar por modulo y contrato.
- Validar inputs con Zod.
- Auditar mutaciones criticas.
- Emitir eventos de integracion.
- Mantener providers intercambiables.
- Crear migraciones incrementales y revisables.
- Agregar tests donde haya reglas de negocio, permisos o eventos.

