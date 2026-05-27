# RepairLab - Next Steps

Actualizado: 2026-05-25, America/Costa_Rica.

## Objetivo de esta hoja de ruta

Priorizar pasos que reducen riesgo real sin romper el workflow ya construido. RepairLab ya tiene mucho producto funcional; el siguiente trabajo debe enfocarse en hardening, confiabilidad y preparacion de produccion controlada.

## Fase 0 - Confirmar estado antes de nuevas features

1. Revisar working tree y decidir que cambios actuales se commitean.
2. Confirmado el 2026-05-25:
   - Docker/PostgreSQL local accesible.
   - `npx prisma migrate status` al dia.
   - `npx prisma validate` OK.
   - `npx prisma generate` OK.
   - `npm run seed:admin` OK.
   - `npm run lint` OK.
   - `npx tsc --noEmit` OK.
3. Pendiente antes de nuevas features grandes: estabilizar o relanzar Next dev y recorrer flujo end-to-end:
   - intake
   - ticket
   - quote
   - invoice
   - payment
   - inventory
   - portal
   - PDF
   - message log
4. Confirmar que `.env` local no contiene secretos que puedan filtrarse.

## Fase 1 - Hardening minimo de demo expuesta

Prioridad alta si se va a usar ngrok o demo externa.

- Implementado el 2026-05-25:
  - Rate limiting para login.
  - Rate limiting para `/track/[token]`.
  - Rate limiting para PDFs publicos.
  - Registro de intentos de login en `AuditLog`.
- Pendiente:
  - Rate limiting para acciones admin sensibles adicionales.
  - Metricas/alertas de abuso.
  - Store compartido para multiples instancias.
- Revisar `AUTH_SECRET` fuerte.
- Definir usuario demo con password fuerte.
- Configurar `APP_URL` / `PUBLIC_SITE_URL` para ngrok.
- Confirmar que n8n y Ollama no quedan expuestos.
- Agregar banner interno si el entorno es demo.

## Fase 2 - Storage privado real

El mayor gap funcional actual es fotos/archivos.

- Implementado el 2026-05-25:
  - Provider local privado.
  - Binarios fuera de `public`.
  - Validacion de extension, MIME, tamano y cantidad.
  - Route handler protegido `/admin/files/[fileAssetId]`.
  - Portal cliente sin archivos privados.
- Pendiente:
  - Backup de `storage/private`.
  - Antivirus/escaneo si se aceptan PDFs.
  - Migracion futura a S3/MinIO para multiples instancias.

## Fase 3 - Outbox worker para integraciones

`IntegrationEvent` ya existe; falta procesador.

- Crear worker local simple o comando script.
- Procesar eventos pendientes con idempotencia.
- Reintentos con backoff.
- Estados:
  - `PENDING`
  - `PROCESSING`
  - `PROCESSED`
  - `FAILED`
  - `CANCELLED`
- Mover email real hacia outbox gradualmente.
- Dejar n8n como consumidor, no como fuente de verdad.

## Fase 4 - Observabilidad y backups

- Script de backup PostgreSQL.
- Procedimiento de restore probado.
- Logs estructurados para:
  - auth
  - pagos
  - inventario
  - PDFs
  - emails
  - integration events
- Health check.
- Error boundary/reporting.
- Documentar retencion.

## Fase 5 - Mejoras de modelo de datos

Hacer solo con migraciones pequenas y justificadas.

- Agregar `Invoice.sourceQuoteId` como FK nullable.
- Agregar indices utiles:
  - `Invoice(type, status, createdAt)`
  - `Invoice(type, paymentStatus, createdAt)`
  - `MessageLog(status, createdAt)`
  - `Ticket(status, createdAt)`
- Evaluar `publicAccessTokenRevokedAt` o expiracion opcional.
- Evaluar tabla para login attempts/sessions si se quiere revocacion.

## Fase 6 - Testing y CI

- Unit tests para:
  - ticket transitions
  - quote transitions
  - invoice conversion
  - payment validation
  - inventory deduction
  - public tracking data filtering
- Integration tests con DB test.
- CI:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx prisma validate`
  - tests
- No depender de `next build` en Windows hasta resolver Turbopack/permisos.

## Fase 7 - Produccion controlada

- Dockerfile de app.
- `docker-compose.prod.yml` o despliegue VPS.
- Reverse proxy con TLS.
- Variables por ambiente.
- Backups automatizados.
- Migraciones controladas.
- Rollback documentado.
- Monitoreo.

## Integraciones futuras recomendadas

### Email

El primer provider real razonable es Resend porque ya hay base implementada.

Pasos:

- Confirmar dominio/remitente.
- Configurar `RESEND_API_KEY`.
- Mover envio a worker/outbox.
- Agregar retries.
- Agregar unsubscribe solo si se hacen emails no transaccionales.

### WhatsApp

No implementar hasta tener:

- Contrato de templates.
- Consentimiento/contact preference.
- Webhook signature validation.
- MessageLog unificado.
- Rate limit y retries.

### n8n

Usarlo solo como automatizador:

- Consumir `IntegrationEvent`.
- Firmar webhooks.
- No escribir estado principal sin pasar por APIs validadas.

### IA/Ollama

No usar para decisiones criticas.

Primeros casos seguros:

- resumen de ticket para staff;
- sugerencias de respuesta;
- busqueda semantica en knowledge base;
- ayuda tecnica interna.

Requisitos:

- Dataset limpio.
- Redaccion/filtrado de datos sensibles.
- Registro de `AIInteraction`.
- Aprobacion humana.

## No hacer todavia

- Multi-tenant.
- Ecommerce completo.
- Pagos online.
- Facturacion fiscal oficial.
- OAuth/social login.
- WhatsApp real sin outbox/consentimiento.
- Exponer Ollama/n8n publicamente.
