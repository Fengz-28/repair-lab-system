# RepairLab - Infrastructure

Actualizado: 2026-05-25, America/Costa_Rica.

## Infraestructura real versionada

El repositorio versiona solo una pieza de infraestructura: PostgreSQL con pgvector mediante Docker Compose.

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg17
    container_name: repair_lab_postgres
    ports:
      - "5432:5432"
    volumes:
      - repair_lab_pgdata:/var/lib/postgresql/data
```

Variables del contenedor:

- `POSTGRES_USER=repairlab`
- `POSTGRES_PASSWORD=repairlab_password`
- `POSTGRES_DB=repairlab`

Esto es adecuado para desarrollo local, no para produccion.

## Servicios que NO estan orquestados por Docker Compose

- App Next.js.
- n8n.
- Ollama.
- ngrok.
- Reverse proxy.
- TLS.
- Worker de eventos.
- Backups.
- Monitoreo.

Si esos servicios se usan localmente, se ejecutan fuera de la infraestructura versionada del repo.

## Networking actual

```txt
Host Windows
  |
  +-- npm run dev / next dev  (puerto usual 3000, no definido en docker-compose)
  |
  +-- Docker PostgreSQL
        localhost:5432 -> container:5432
```

No se observo red Docker compartida con app Next ni servicios auxiliares.

## Variables de entorno

Contrato en `.env.example`:

### App

- `APP_ENV`
- `APP_URL`
- `PUBLIC_SITE_URL`
- `ADMIN_ALLOWED_ORIGINS`

### DB

- `DATABASE_URL`

### Auth

- `AUTH_SECRET`
- `SESSION_COOKIE_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

### Seguridad

- `CORS_ALLOWED_ORIGINS`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_LOGIN_WINDOW_SECONDS`
- `RATE_LIMIT_LOGIN_MAX_ATTEMPTS`
- `RATE_LIMIT_PUBLIC_WINDOW_SECONDS`
- `RATE_LIMIT_PUBLIC_MAX_REQUESTS`
- `WEBHOOK_SIGNATURE_TOLERANCE_SECONDS`

### Storage

- `STORAGE_PROVIDER`
- `PRIVATE_STORAGE_ROOT`
- `S3_*`

### Email

- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `EMAIL_PROVIDER_KEY`
- `RESEND_API_KEY`
- `SMTP_*`

### Integraciones futuras

- `WHATSAPP_*`
- `GOOGLE_CALENDAR_*`
- `N8N_*`
- `OLLAMA_*`
- `AI_*`
- `TRELLO_*`

No se deben documentar valores reales de `.env`.

## Prisma y migraciones

Configuracion:

- `prisma.config.ts` usa `DATABASE_URL`.
- Schema: `prisma/schema.prisma`.
- Migraciones: `prisma/migrations`.

Migraciones presentes:

```txt
20260517013906_init
20260517030000_foundation_intake
20260517040000_catalog_pricing_inventory
20260517050000_quotes_foundation
20260517120000_manual_payments_foundation
20260517130000_optional_inventory_tracking
20260518013310_fix_invoice_itemtype_default
20260520120000_ticket_public_access_token
20260520130000_admin_roles_auth
```

La migracion `foundation_intake` crea `CREATE EXTENSION IF NOT EXISTS vector;`.

No se verifico el estado aplicado de migraciones contra DB. Antes de cambios de schema ejecutar:

```txt
npx prisma migrate status
```

## Build y Windows

`next.config.ts` incluye:

```ts
turbopack: {
  root: process.cwd(),
}
```

Esto fue agregado por problema de deteccion de root en Windows. `docs/WINDOWS_BUILD_NOTES.md` documenta que `next build` con Turbopack fallo por permisos:

```txt
Acceso denegado. (os error 5)
```

Decision historica: no repetir build con permisos elevados; usar `prisma validate`, `tsc --noEmit` y `eslint` para verificaciones locales mientras se investiga.

## Dependencias criticas

Runtime:

- `next 16.2.6`
- `react 19.2.4`
- `react-dom 19.2.4`
- `@prisma/client`
- `@prisma/adapter-pg`
- `prisma`
- `zod`
- `bcryptjs`
- `pdf-lib`

Dev/tooling:

- `typescript`
- `eslint`
- `eslint-config-next`
- `tailwindcss`
- `@tailwindcss/postcss`

Observacion: `bcryptjs` estuvo duplicado en `package.json` y fue corregido el 2026-05-25 sin cambiar version.

## Scripts

```txt
npm run dev
npm run build
npm run start
npm run lint
npm run seed:admin
```

`seed:admin` crea/actualiza admin usando:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

La password debe tener al menos 10 caracteres.

## ngrok readiness

No hay configuracion versionada de ngrok. Para demo, ngrok puede apuntar a la app local, pero antes hay que revisar:

- `NEXT_PUBLIC_APP_URL` / `APP_URL` / `PUBLIC_SITE_URL` para links en emails/PDFs/portal.
- Cookies secure/sameSite en entorno expuesto.
- Rate limiting no implementado.
- No exponer n8n/Ollama.
- No usar credenciales demo debiles.

## VPS readiness

El proyecto es portable conceptualmente, pero no esta listo para VPS sin trabajo adicional.

Falta:

- Dockerfile de app.
- Compose productivo con app + DB + red privada.
- Reverse proxy con TLS.
- Secrets management.
- Backups.
- Health checks.
- Logs persistentes.
- Politica de migraciones.
- Worker de eventos.
- Rate limiting.
- Configuracion de dominio.

## Produccion vs desarrollo

### Desarrollo actual

```txt
Next dev local
Postgres docker local
Email console/disabled/resend
Storage placeholder
Integraciones disabled
```

### Produccion requerida

```txt
Next app build estable
PostgreSQL gestionado o contenedor con backups
Secrets reales
TLS
Rate limiting
Storage privado real
Email provider real
Workers para eventos
Observabilidad
Plan de rollback
```

## DevOps observado

### Existente

- Scripts npm basicos.
- Prisma migrations versionadas.
- Seed de admin local.
- `.env.example` amplio.
- `.gitignore` protege `.env`, `.next`, `node_modules`, storage local y `*.tsbuildinfo`.
- Documento de problema Windows/Turbopack.

### No observado

- CI/CD.
- Tests automatizados.
- Dockerfile de app.
- Compose productivo.
- Backups.
- Restore procedure.
- Health checks.
- Logs estructurados.
- Monitoreo/alertas.
- Error tracking.
- Politica de migraciones por ambiente.

### Recomendacion de pipeline minimo

```txt
install
  -> prisma validate
  -> prisma generate
  -> lint
  -> tsc --noEmit
  -> tests
  -> build en ambiente Linux/CI
```

## Verificacion local de infraestructura - 2026-05-25

Comandos ejecutados:

- `npx prisma migrate status`
- `npx prisma validate`
- `npx prisma generate`
- `npm run lint`
- `npx tsc --noEmit`
- `docker ps --filter name=repair_lab_postgres`

Resultados:

- Prisma schema valido.
- Prisma Client generado correctamente.
- Lint y TypeScript pasaron sin errores.
- Estado de migraciones no confirmado porque Docker/PostgreSQL local no estaba disponible.
- Docker CLI reporto que no podia conectarse a `dockerDesktopLinuxEngine`.

Accion requerida:

```txt
1. Iniciar Docker Desktop.
2. Confirmar que repair_lab_postgres este arriba.
3. Repetir npx prisma migrate status.
```

## Saneamiento local minimo - 2026-05-25

Estado confirmado despues de iniciar/acceder Docker:

- `docker ps`: accesible fuera del sandbox.
- Contenedor `repair_lab_postgres`: running.
- Imagen: `pgvector/pgvector:pg17`.
- Puerto: `5432`.
- `npx prisma migrate status`: DB al dia con 9 migraciones.
- `npx prisma validate`: schema valido.
- `npx prisma generate`: Prisma Client generado.

Limitacion observada:

- Next dev pudo responder inicialmente al login, pero luego quedo un proceso Node colgado sin puerto escuchando.
- Se detuvo el proceso colgado para no dejar el entorno local en mal estado.
- No se ejecuto `next build` por el problema Windows/Turbopack documentado.

## Rate limiting - 2026-05-25

Variables:

- `RATE_LIMIT_ENABLED`: activa/desactiva rate limiting. Default efectivo: activado salvo que sea `false`.
- `RATE_LIMIT_LOGIN_WINDOW_SECONDS`: ventana para intentos de login. Default: `300`.
- `RATE_LIMIT_LOGIN_MAX_ATTEMPTS`: intentos por IP/email dentro de la ventana. Default: `5`.
- `RATE_LIMIT_PUBLIC_WINDOW_SECONDS`: ventana para portal/PDFs publicos. Default: `60`.
- `RATE_LIMIT_PUBLIC_MAX_REQUESTS`: solicitudes por IP/token dentro de la ventana. Default: `120`.

Implementacion:

- Store in-memory por proceso Node.
- Compatible con local, ngrok y reverse proxy si se preservan `x-forwarded-for` o `x-real-ip`.
- No requiere Redis en esta fase.

Limitacion:

- No es apto para multiples instancias ni serverless distribuido. Para produccion se debe reemplazar por Redis/Upstash/DB o un rate limiter del reverse proxy.
