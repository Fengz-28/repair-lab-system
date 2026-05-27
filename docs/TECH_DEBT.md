# RepairLab - Technical Debt and Risks

Actualizado: 2026-05-25, America/Costa_Rica.

## Riesgos criticos antes de produccion

### 1. Rate limiting inicial in-memory

Existe rate limiting server-side para login, portal publico y PDFs publicos, pero usa memoria del proceso. Riesgo:

- No protege entre multiples instancias.
- Se reinicia al reiniciar la app.
- Puede ser insuficiente para produccion con varios procesos o serverless.

Mitigacion:

- Migrar a Redis, Upstash, DB compartida o rate limiting de reverse proxy.
- Mantener limites especificos por ruta.
- Agregar metricas/alertas de abuso.

### 2. Middleware admin solo verifica presencia de cookie

`middleware.ts` redirige segun exista cookie, pero no valida firma, expiracion ni rol. La seguridad real depende de `requireLocalStaff` en paginas/actions.

Riesgo:

- Si una ruta admin futura olvida `requireLocalStaff`, el middleware no la protege realmente.

Mitigacion:

- Mantener `requireLocalStaff` obligatorio en toda ruta/action admin.
- Considerar validacion criptografica ligera en middleware si el costo es aceptable.
- Agregar checklist o test de rutas admin.

### 3. Sin CSRF explicito

Las Server Actions usan cookies `sameSite=lax`, pero no se observo token CSRF explicito para acciones sensibles.

Riesgo:

- Mutaciones admin potencialmente expuestas si se introduce algun patron vulnerable.

Mitigacion:

- Evaluar CSRF tokens para acciones criticas: pagos, inventario, estado de ticket, facturas.

### 4. Storage local privado requiere hardening productivo

Existe storage binario local privado para intake/tickets, pero sigue siendo una implementacion local.

Riesgo:

- En multiples instancias, un archivo podria existir solo en una maquina.
- No hay antivirus ni analisis de contenido.
- No hay politica de retencion ni backup especifico de storage.

Mitigacion:

- Respaldar `storage/private`.
- Migrar a S3/MinIO para produccion multi-instancia.
- Agregar antivirus/escaneo si se aceptan PDFs u otros documentos.
- Definir retencion y borrado seguro.

### 5. Emails reales aun ocurren dentro del flujo operativo

Existe worker local para `IntegrationEvent`, pero el servicio de email transaccional todavia registra y envia en el mismo flujo. Captura errores, pero sigue siendo I/O externo cercano al dominio.

Riesgo:

- Latencia en mutaciones.
- Timeouts externos.
- Dificultad para retries.

Mitigacion:

- Usar `IntegrationEvent` como outbox real.
- Worker separado para emails e integraciones.
- Reintentos e idempotencia.
- Migrar gradualmente a eventos `notification.email.requested` para evitar dual writes sin duplicar correos.

### 6. Backups locales sin automatizacion externa ni observabilidad

Ya existen scripts de backup local y `/api/health`, pero no hay automatizacion externa, backups remotos, logs estructurados ni alertas.

Riesgo:

- Perdida de datos.
- Dificultad para diagnosticar produccion.
- Falsa sensacion de seguridad si los backups locales quedan en el mismo disco.

Mitigacion:

- Automatizar backup diario PostgreSQL y storage.
- Retencion y restore test.
- Copia externa/offsite.
- Logs JSON.
- Monitoreo de errores y uptime.

## Deuda de modelo de datos

### Quote -> Invoice sin FK explicita

La factura generada desde quote se detecta mediante `internalNotes` con `sourceQuoteId:<quoteId>`.

Riesgo:

- Fragil ante edicion manual.
- Dificil de consultar/reportar.
- No hay integridad referencial.

Mitigacion futura:

- Agregar `sourceQuoteId` nullable en `Invoice`.
- Unique parcial o validacion para evitar duplicados.

### `Invoice` unifica quote, invoice y receipt

Funciona para MVP modular, pero aumenta complejidad de estados.

Riesgo:

- Estados aplicables a quote se mezclan con factura.
- Facturacion fiscal futura puede requerir entidad propia.

Mitigacion:

- Mantener reglas por `type`.
- Documentar transiciones por tipo.
- Considerar separacion si se implementa facturacion fiscal real.

### `FileAsset.ownerType/ownerId` es polimorfico

Permite flexibilidad, pero no tiene FK real.

Riesgo:

- Assets huerfanos.
- Integridad a nivel de app solamente.

Mitigacion:

- Mantener relaciones concretas (`intakeId`, `ticketId`) cuando sea posible.
- Crear tareas de limpieza/auditoria.

### `ADJUSTMENT` de inventario suma cantidad

El movimiento `ADJUSTMENT` actualmente se comporta como ajuste incremental, no como "set absolute".

Riesgo:

- Confusion operacional.

Mitigacion:

- Aclarar UI y documentacion.
- Si se requiere conteo fisico, crear tipo `COUNT` o campo `newQuantity`.

## Deuda de frontend/UI

### Dark-first global con overrides amplios

La migracion visual dark-first usa estilos globales fuertes para homogeneizar.

Riesgo:

- Algunos componentes futuros pueden heredar estilos inesperados.
- Dificulta migraciones finas si se quiere tema multi-mode.

Mitigacion:

- Consolidar tokens en componentes RepairLab.
- Reducir overrides globales cuando todas las pantallas esten migradas.

### Muchas paginas admin con composicion grande

La modularizacion visual mejoro, pero algunos pages siguen acumulando datos y layout.

Riesgo:

- Dificil testear y mantener.

Mitigacion:

- Mover queries complejas a services.
- Mantener componentes presentacionales puros.

## Deuda de escalabilidad

### Capacidad estimada actual

No hay pruebas de carga. Cualquier numero es estimacion, no garantia.

Con la arquitectura actual, en una PC local o VPS pequeno, el sistema deberia funcionar bien para un taller pequeno con pocos usuarios internos concurrentes y volumen moderado:

- 1 a 5 usuarios staff concurrentes: esperado razonable.
- 10 a 20 usuarios concurrentes mezclando admin/portal: posible, dependiente de CPU, RAM, DB y PDFs.
- Cientos de clientes concurrentes: no recomendado sin rate limiting, caching, paginacion y observabilidad.

Factores que limitan:

- Next app y DB probablemente corren en una sola maquina.
- PDFs se generan sin cache.
- Emails/integraciones no usan worker.
- Dashboard y listados hacen consultas directas.
- No hay pooling externo ni separacion read/write.

### Listados sin paginacion robusta en todos lados

Algunas pantallas usan `take` limitado, pero no hay paginacion completa consistente.

Riesgo:

- Degradacion con muchos tickets/mensajes/clientes.

Mitigacion:

- Cursor pagination en tickets, messages, customers.
- Indices compuestos por filtros principales.

### Dashboard con muchas consultas

El dashboard ejecuta agregados y listas en paralelo.

Riesgo:

- Carga creciente en DB.

Mitigacion:

- Indices por `type/status/paymentStatus/createdAt`.
- Materializar metricas si el volumen crece.

### PDFs generados sin cache

PDFs se generan server-side por request.

Riesgo:

- Costo CPU si se descargan masivamente.

Mitigacion:

- Cache privado o regeneracion bajo demanda.
- Rate limit en rutas PDF.

## Deuda de seguridad media/baja

- No hay bloqueo de cuenta por intentos fallidos.
- No hay rotacion/revocacion de sesiones centralizada.
- `AUTH_SECRET` tiene fallback en desarrollo; correcto para dev, prohibido en prod.
- `.env.example` esta bien, pero se debe verificar que `.env` nunca se comitee.
- Docker Compose usa password de desarrollo visible; no usar en produccion.
- Console email puede imprimir datos de clientes en logs locales.
- Tokens publicos no tienen expiracion/revocacion visible.

## Problemas menores detectados

- `package.json` contenia `bcryptjs` duplicado en `dependencies`; corregido el 2026-05-25 sin cambiar version.
- `structure.txt` aparece no trackeado y probablemente generado; evaluar eliminar/ignorar.
- `docs/SECURITY.md` menciona roles `admin/staff`, desactualizado frente a `ADMIN/TECHNICIAN/RECEPTIONIST`.
- Build con Turbopack en Windows tiene problema documentado de permisos/root; no repetir build elevado sin decision explicita.
- `npm install` reporto 5 vulnerabilidades moderadas; revisar con `npm audit` antes de aplicar fixes automaticos.

## Prioridad sugerida de deuda

1. Automatizar backups y probar restore.
2. Outbox worker para `IntegrationEvent` y email.
3. Paginacion e indices para listados grandes.
4. FK `sourceQuoteId` para factura generada desde quote.
5. CI con lint, typecheck y prisma validate.
6. Observabilidad minima.
7. Migrar rate limiting in-memory a store compartido antes de multi-instancia.
8. Migrar storage local a S3/MinIO antes de multiples instancias.
