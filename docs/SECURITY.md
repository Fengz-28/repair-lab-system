# Seguridad

## Reglas obligatorias

- No hardcodear secretos.
- `.env` debe estar ignorado por Git.
- `.env.example` debe existir con nombres de variables, no secretos reales.
- Validar inputs con Zod.
- Proteger endpoints administrativos.
- Usar roles minimos `admin` y `staff`.
- Guardar fotos privadas fuera de `public/`.
- No exponer Ollama publicamente.
- No exponer n8n sin autenticacion.
- Restringir CORS.
- Preparar rate limiting.
- Firmar webhooks.
- Auditar mutaciones criticas.

## Secretos

Variables sensibles esperadas:

- `DATABASE_URL`
- `AUTH_SECRET`
- `N8N_WEBHOOK_SECRET`
- `SMTP_*`
- `WHATSAPP_*`
- `GOOGLE_CALENDAR_*`
- `OLLAMA_BASE_URL`
- `STORAGE_*`

No deben aparecer en commits, logs, screenshots publicos ni respuestas de API.

## Webhooks

Todo webhook entrante debe:

- validar firma,
- validar timestamp,
- validar payload,
- usar idempotencia,
- registrar evento,
- responder sin filtrar internals.

## Archivos privados

Las fotos de equipos deben:

- guardarse fuera de `public/`,
- registrarse como `FileAsset`,
- servirse mediante endpoint autenticado,
- soportar URLs firmadas temporales en el futuro,
- auditar subida, acceso sensible y eliminacion logica.

## n8n

- No es fuente de verdad.
- Debe estar detras de auth.
- Debe consumir API/webhooks controlados.
- Debe tener secreto por webhook.

## Ollama

- Solo local o red privada.
- No exponer por ngrok ni internet.
- No enviar secretos en prompts.
- Las respuestas sugeridas deben revisarse por staff.

## Produccion futura

- TLS en reverse proxy.
- Backups diarios.
- Backups de storage privado.
- Rotacion de secretos.
- Logs centralizados.
- Usuario DB con privilegios minimos.

