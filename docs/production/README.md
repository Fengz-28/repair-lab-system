# FengzLab / RepairLab - Production Readiness

Actualizado: 2026-06-13, America/Costa_Rica.

## Section A - Production baseline

Este documento es el indice operativo para preparar FengzLab / RepairLab para produccion de forma incremental.

El objetivo actual no es convertir el sistema en un SaaS generico. El objetivo es poder operar el taller real de FengzLab con seguridad, trazabilidad y datos protegidos.

## Principios de produccion

- FengzLab es workshop-first.
- PostgreSQL es la fuente de verdad.
- RepairLab puede seguir existiendo como nombre tecnico legacy dentro del codigo.
- No agregar multi-tenant, pricing SaaS, marketplace ni onboarding de terceros.
- No inventar secretos, dominios, proveedores ni infraestructura.
- No exponer archivos privados de clientes desde `public/`.
- No exponer n8n, Ollama ni automatizaciones internas por internet.
- Preferir cambios pequenos, verificables y reversibles.

## Estado actual observado

### Estructura del repo inspeccionada

Rutas relevantes observadas para produccion:

- `src/app`: rutas publicas, admin, portal cliente, PDFs y healthcheck.
- `src/components`: UI compartida publica/admin.
- `src/modules`: logica de dominio para portal, pagos, cotizaciones, tickets e intake.
- `src/server`: auth, Prisma, seguridad, storage y servicios server-side.
- `prisma`: schema y migraciones versionadas.
- `scripts`: seed admin, backups y worker de eventos.
- `docs`: arquitectura, seguridad, infraestructura, backups, roadmap y estado actual.
- `docker-compose.yml` y `Dockerfile`: base local/demo con PostgreSQL y app.

### Instrucciones de proyecto encontradas

- `AGENTS.md`: reglas principales del repo. Define PostgreSQL como fuente de verdad, separacion entre UI/dominio/servicios/providers/infraestructura, validacion con Zod, proteccion admin por roles `admin` y `staff`, fotos privadas fuera de `public/`, y no exponer n8n/Ollama publicamente.
- `CLAUDE.md`: apunta a `AGENTS.md`.
- `agents/`: contiene agentes especializados del proyecto, incluyendo arquitectura backend, frontend, UI/UX, QA, seguridad, inventario, contenido, reality checker y brand guardian.

### Skills disponibles observadas

Skills locales relevantes en `C:\Users\PC MASTER\.codex\skills`:

- `gstack`
- `ce-plan`
- `ce-work`
- `ce-compound`
- `ui-ux-pro-max`
- `taste-skill`
- `the-architect`
- `stop-slop`
- `understand`
- `playwright`

Para Section A se uso gstack como marco de Goal Pursuit Mode. No se ejecuto QA browser porque esta seccion es documental y no modifica UI/runtime.

### Stack detectado

El proyecto usa Next.js, React, TypeScript, Prisma, PostgreSQL y Tailwind.

Package manager detectado: `npm`, por `package-lock.json` y scripts en `package.json`.

Scripts relevantes en `package.json`:

```txt
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run seed:admin
npm run backup
npm run worker:events
```

### Variables de entorno

El contrato principal vive en `.env.example`.

Grupos relevantes:

- App: `APP_ENV`, `APP_URL`, `PUBLIC_SITE_URL`, `ADMIN_ALLOWED_ORIGINS`.
- Database: `DATABASE_URL`, `DOCKER_DATABASE_URL`.
- Auth: `AUTH_SECRET`, `SESSION_COOKIE_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
- Security: rate limits, CORS y tolerancia de firma de webhooks.
- Storage: `STORAGE_PROVIDER`, `PRIVATE_STORAGE_ROOT`, limites de upload y MIME types.
- Integraciones futuras: email, WhatsApp, Google Calendar, n8n, Ollama y Trello.

Regla: `.env.example` documenta nombres, no secretos reales.

### Docker local

`docker-compose.yml` define:

- `postgres` con `pgvector/pgvector:pg17`.
- `app` con build local del `Dockerfile`.
- volumen persistente para PostgreSQL.
- volumen persistente para `storage/private`.
- volumen persistente para `backups`.

Este compose es una base local/demo. No es todavia un compose productivo final.

### Healthcheck

Existe `GET /api/health`.

La ruta valida:

- conexion a base de datos con `SELECT 1`;
- acceso de lectura/escritura a storage privado;
- respuesta `200` si todo esta `ok`;
- respuesta `503` si el estado esta `degraded`;
- `Cache-Control: no-store`.

### Backups

Existe documentacion y scripts locales:

- `npm run backup:db`
- `npm run backup:storage`
- `npm run backup`

La estrategia actual es local/manual. Produccion requiere backups externos, retencion, monitoreo y pruebas periodicas de restore.

### Seguridad

`docs/SECURITY.md` define reglas base:

- no hardcodear secretos;
- proteger endpoints administrativos;
- validar inputs con Zod;
- guardar fotos fuera de `public/`;
- auditar mutaciones criticas;
- restringir CORS;
- preparar rate limiting;
- no exponer n8n ni Ollama publicamente.

## Production-critical areas

Areas criticas detectadas para las siguientes secciones:

- Admin interno: auth, roles, server-side guards y acciones sensibles.
- Portal cliente: acceso por token, rate limiting y alcance de datos visibles.
- PDFs publicos: rutas por token para cotizacion/factura.
- Archivos privados: storage fuera de `public/` y endpoint admin protegido.
- PostgreSQL/Prisma: migraciones, relaciones, tickets, cotizaciones, facturas, pagos e historial.
- Backups: scripts locales de DB/storage y restore test documentado.
- Healthcheck: DB y storage.
- Docker/VPS: compose local existente, falta diseno productivo con TLS/reverse proxy.
- Worker de eventos: outbox `run once`, pendiente supervision/scheduler si se usa en produccion.

## Production readiness status

Estado actual de Section A:

- Stack detectado: listo para documentacion inicial.
- Instrucciones de proyecto: detectadas.
- Skills/agentes: detectados.
- Healthcheck: existe.
- Backups locales: existen.
- Docker local/demo: existe.
- Compose productivo final: baseline agregado en Section I.
- Secrets reales: pendientes y no deben inventarse.
- Rate limiting: existe como estrategia in-memory; no es final para multiples instancias.
- Storage privado local: documentado; requiere estrategia productiva si el VPS necesita volumen persistente o S3/MinIO.
- Launch checklist final: agregado en Section K.

## First blockers

Primeros bloqueos de produccion identificados:

- Variables criticas aun viven como placeholders en `.env.example`; Section B ya separo obligatorias, opcionales, publicas y secretas.
- `AUTH_SECRET`, credenciales admin y URLs publicas deben definirse con valores reales antes de exponer el sistema.
- `docker-compose.yml` es local/demo; falta compose o guia final de VPS con reverse proxy, TLS y secretos reales.
- Rate limiting es in-memory; sirve para una instancia simple, pero debe documentarse como limite antes de escalar.
- Backups existen localmente, pero produccion requiere copia externa, retencion y monitoreo.
- El worker de eventos es `run once`; si se usa en produccion necesita scheduler o proceso supervisado.

## Production gates

Estos gates deben estar claros antes de exponer el sistema a clientes reales.

### Gate 1 - Configuracion segura

- `AUTH_SECRET` real y fuerte.
- `ADMIN_PASSWORD` real y fuerte.
- `APP_URL` y `PUBLIC_SITE_URL` correctos para el dominio o tunel usado.
- `ADMIN_ALLOWED_ORIGINS` y `CORS_ALLOWED_ORIGINS` restringidos.
- `EMAIL_PROVIDER` definido conscientemente.
- `AI_PROVIDER`, `WHATSAPP_PROVIDER`, `TRELLO_PROVIDER` y otros proveedores no usados en `disabled`.

### Gate 2 - Datos y storage

- PostgreSQL confirmado con migraciones al dia.
- `PRIVATE_STORAGE_ROOT` persistente y fuera de `public/`.
- Backups de DB y storage ejecutables.
- Restore probado contra una base temporal antes de uso real.

### Gate 3 - Seguridad de acceso

- Rutas admin protegidas por auth server-side.
- Portal publico por token rate-limited.
- PDFs publicos por token rate-limited.
- Archivos privados accesibles solo por endpoints admin autorizados.
- Rate limiting actual entendido como in-memory y no distribuido.

### Gate 4 - Operacion

- `GET /api/health` monitoreable.
- Logs revisables.
- Worker de eventos ejecutado por scheduler o proceso supervisado si se usa.
- Plan de rollback para deploy y migraciones.

## Comandos de verificacion local

Ejecutar antes de considerar una entrega estable:

```txt
npx prisma validate
npx prisma generate
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

Si Docker/PostgreSQL esta disponible:

```txt
npx prisma migrate status
docker compose ps
docker compose exec -T app npx prisma migrate status
docker compose exec -T app npm run worker:events
```

Healthcheck local:

```txt
curl http://localhost:3000/api/health
```

## Lo que NO debe hacerse todavia

- No activar WhatsApp real sin contrato, secretos, logging, auditoria y rollback.
- No activar n8n como fuente de verdad.
- No exponer Ollama por ngrok ni por internet.
- No mover archivos privados a `public/`.
- No agregar multi-tenant.
- No agregar pricing SaaS.
- No usar credenciales demo para un entorno expuesto.

## Estado del flujo A-K

Sections A-K ya estan documentadas. Este README queda como indice vivo; cualquier seccion posterior debe definirse explicitamente antes de modificar runtime, Prisma, Docker/VPS o seguridad.

## Section B status

Section B creo `docs/production/env.md` y agrego a `.env.example` los nombres usados por codigo que faltaban:

- `NEXT_PUBLIC_APP_URL`
- `POSTGRES_CONTAINER_NAME`

No se cambio comportamiento runtime.

## Section C status

Section C creo `docs/production/authz.md` y aplico un hardening minimo: `/admin/intake` ahora llama `requireLocalStaff()` server-side antes de consultar recepciones recientes.

No se redisenio auth, no se cambio Prisma y no se continuo a Section D.

## Section D status

Section D creo `docs/production/security-controls.md` y agrego un guard CSRF simple por `Origin`/`Host` para login, logout y server actions admin sensibles.

El rate limiting existente cubre login y portal publico por token. El store sigue siendo in-memory y queda diferido para una seccion posterior de infraestructura/produccion.

## Section E status

Section E creo `docs/production/private-files.md`, confirmo storage local privado fuera de `public/` y aplico dos hardenings pequenos: `PRIVATE_STORAGE_ROOT` ya no puede apuntar al root del proyecto y los adjuntos de ticket respetan `MAX_UPLOAD_FILES_PER_TICKET` de forma acumulada.

No se cambio Prisma, no se migro a cloud storage y no se continuo a Section F.

## Section F status

Section F creo `docs/production/database-integrity.md` y audito modelos criticos, relaciones, tokens, indices, trazabilidad, pagos, inventario e `IntegrationEvent`.

No se aplico migracion Prisma en esta seccion. Los indices candidatos quedaron documentados para una migracion no destructiva posterior si se aprueba.

## Section G status

Section G creo `docs/production/backups-restore.md` y consolido el flujo de backup/restore para PostgreSQL y storage privado.

No se cambio runtime, Prisma ni Docker. No se agrego script de restore porque restaurar datos activos requiere target temporal, backup previo y aprobacion explicita.

## Section H status

Section H creo `docs/production/observability.md` y documento el estado de healthcheck, logging y monitoreo.

No se cambio runtime. El healthcheck existente ya valida DB y storage sin exponer secretos; logs estructurados y alertas externas quedan diferidos para una seccion operativa posterior.

## Section I status

Section I creo `docker-compose.production.yml` y `docs/production/vps-deploy.md` como baseline para un VPS simple.

PostgreSQL queda sin puerto publico, la app se publica solo en `127.0.0.1:${APP_PORT:-3000}` para reverse proxy HTTPS, los uploads/backups usan volumenes persistentes y las migraciones se ejecutan explicitamente con el servicio `migrate`.

## Section J status

Section J creo `docs/production/test-validation.md` y agrego pruebas enfocadas para rate limiting y seguridad de storage privado.

La validacion de esta seccion cubre Prisma validate, lint, typecheck y test suite. E2E, Docker build y restore drill quedan como validaciones manuales/operativas posteriores.

## Section K status

Section K creo `docs/production/launch-checklist.md` y consolido los gates finales de lanzamiento desde Sections A-J.

No se cambio runtime, Prisma ni Docker. La checklist cubre preflight, secuencia de deploy, post-launch, no-go conditions y riesgos diferidos para un primer despliegue controlado del taller.

## Home-hosted tunnel status

Se agrego `docs/production/home-hosted-tunnel.md` para documentar la fase temporal de staging/operacion temprana desde la workstation local por Cloudflare Tunnel hacia `http://localhost:3001`.

Esta fase es apta para validacion local/staging controlada y operacion temprana con cautela. No reemplaza los gates finales de produccion, restore drill, monitoreo y despliegue VPS futuro.
