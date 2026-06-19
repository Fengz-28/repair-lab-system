# Home-hosted Cloudflare Tunnel Plan

Actualizado: 2026-06-19, America/Costa_Rica.

## Objetivo

Permitir una primera operacion real controlada de FengzLab desde la workstation local, usando Cloudflare Tunnel como entrada HTTPS publica hacia la app local.

Este plan no reemplaza un VPS productivo final. Es una fase temprana para validar operacion del taller, flujo admin, portal cliente, PDFs, backups y monitoreo antes de invertir en infraestructura permanente.

## Alcance actual

- Dominio publico de staging: `https://staging.fengzlab.tech`.
- Origen local del tunel: `http://localhost:3001`.
- Cloudflare Tunnel activo y saludable.
- Cloudflare Access recomendado para proteger staging.
- Next.js corre localmente en la workstation del taller.
- PostgreSQL y storage privado siguen siendo responsabilidad local.

## Principios

- Workshop-first: esta fase existe para operar el taller, no para vender SaaS.
- No exponer n8n, Ollama, Prisma Studio, Postgres ni storage privado por internet.
- No publicar secretos en docs, commits, logs ni screenshots.
- Mantener `AUTH_SECRET` estable entre reinicios.
- Tratar la workstation como servidor temporal: energia, red, backups y actualizaciones importan.
- Preferir cambios reversibles y faciles de auditar.

## Variables esperadas para staging por tunel

Ejemplo de valores esperados en el entorno local que corre la app:

```env
APP_URL=https://staging.fengzlab.tech
NEXT_PUBLIC_APP_URL=https://staging.fengzlab.tech
NODE_ENV=production
AUTH_SECRET=<strong-stable-secret>
SESSION_SECRET=<strong-stable-secret-if-used>
TOKEN_SECRET=<strong-stable-secret-if-used>
PRIVATE_STORAGE_ROOT=./storage/private
```

Reglas:

- Los secretos reales no se commitean.
- `AUTH_SECRET` debe ser fuerte y estable; cambiarlo invalida sesiones existentes.
- `APP_URL` y `NEXT_PUBLIC_APP_URL` deben apuntar al dominio publico usado por el navegador, no a `localhost`.
- `PRIVATE_STORAGE_ROOT` debe apuntar a una ubicacion persistente y fuera de `public/`.

## Proceso recomendado para correr staging local

1. Confirmar que `.env` local contiene las URLs publicas de staging y secretos reales estables.
2. Confirmar que PostgreSQL local esta disponible y con migraciones al dia.
3. Confirmar que `storage/private` existe o puede crearse.
4. Iniciar la app en el puerto del origen del tunel:

```txt
npm run build
npm run start -- -p 3001
```

Para depuracion local tambien puede usarse:

```txt
npm run dev -- -p 3001
```

5. Confirmar healthcheck local:

```txt
curl http://localhost:3001/api/health
```

6. Confirmar healthcheck por staging si Cloudflare Access lo permite o desde un navegador autorizado:

```txt
https://staging.fengzlab.tech/api/health
```

## Seguridad minima

- Cloudflare Access debe proteger staging mientras se valida el sistema.
- El admin local de la app sigue siendo obligatorio; Cloudflare Access no reemplaza la autorizacion interna.
- Las cookies de sesion deben funcionar contra `staging.fengzlab.tech` y persistir al refrescar rutas admin.
- No abrir puertos directos de PostgreSQL, storage, n8n ni Ollama al internet.
- No usar credenciales demo en un entorno accesible desde internet.

## Operacion diaria durante esta fase

Antes de usar con trabajo real:

- Ejecutar backup de DB y storage privado.
- Validar `/api/health`.
- Abrir admin, tickets, intake, portal cliente y PDFs.
- Confirmar que Cloudflare Tunnel esta conectado.
- Confirmar que la workstation no entrara en suspension.

Despues de cambios importantes:

- Ejecutar `npm run lint`.
- Ejecutar `npx tsc --noEmit`.
- Ejecutar `npm run test`.
- Ejecutar `npm run build`.
- Probar login y rutas protegidas por staging.

## Riesgos aceptados temporalmente

- La disponibilidad depende de la workstation, electricidad, router e internet local.
- Los backups externos aun deben configurarse como rutina real.
- El rate limiting in-memory funciona para una instancia simple, pero no es distribuido.
- No hay supervisor productivo documentado para reiniciar automaticamente la app si cae.
- Staging por tunel no sustituye un plan final de VPS, reverse proxy, TLS operativo, alertas y backups externos.

## No-go para clientes reales

No usar con clientes reales si ocurre cualquiera de estas condiciones:

- `AUTH_SECRET` no esta configurado o cambia entre reinicios.
- `APP_URL` o `NEXT_PUBLIC_APP_URL` apuntan a `localhost` en staging.
- `/api/health` responde `degraded`.
- No existe backup reciente de DB y storage privado.
- Cloudflare Access no protege staging durante pruebas.
- Las rutas admin pierden sesion despues de login o refresh.
- Los PDFs publicos o portal cliente muestran datos incorrectos o privados.

## Camino a VPS futuro

Mover a VPS solo despues de validar:

- Flujo intake -> ticket -> quote -> invoice -> payment.
- Portal cliente y PDFs.
- Backups y restore drill contra targets temporales.
- Monitoreo minimo y alertas.
- Uso real del taller durante una ventana controlada.

El documento `docs/production/vps-deploy.md` sigue siendo la referencia para un despliegue VPS posterior.
