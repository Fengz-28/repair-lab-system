<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repair Lab System agent rules

## Arquitectura

- PostgreSQL es la fuente de verdad.
- n8n solo automatiza y consume eventos; no debe ser fuente de verdad.
- No implementar integraciones reales sin contrato, validacion, auditoria, variables de entorno y estrategia de errores.
- Separar UI, dominio, servicios, providers, adapters e infraestructura.
- La UI no debe importar Prisma directamente.
- Los providers externos deben vivir detras de interfaces.

## Seguridad

- No hardcodear secretos.
- `.env` no debe versionarse.
- `.env.example` documenta variables sin valores reales.
- Validar inputs con Zod en formularios, route handlers, server actions y webhooks.
- Proteger rutas administrativas con roles `admin` y `staff`.
- Las fotos de recepcion son privadas por defecto y no deben guardarse en `public/`.
- No exponer Ollama ni n8n publicamente sin autenticacion y red segura.
- Preparar CORS restringido, rate limiting y webhook signatures.

## Alcance actual

No implementar todavia:

- WhatsApp Business Cloud API real.
- SMTP real.
- Google Calendar API real.
- pagos,
- OAuth complejo,
- IA/RAG funcional completo,
- deployment productivo.

## Estructura objetivo

```txt
src/app/
src/components/
src/modules/
src/server/
src/services/
src/integrations/
src/ai/
src/emails/
src/lib/
prisma/
docs/
```

## Definicion de listo para nuevas features

- Modelo de datos revisado.
- Validacion de entrada definida.
- Permisos definidos.
- Auditoria definida.
- Eventos emitidos cuando aplique.
- Provider externo desacoplado si aplica.
- Tests proporcionales al riesgo.
