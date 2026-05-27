# RepairLab - Manual E2E Checklist

Actualizado: 2026-05-27, America/Costa_Rica.

## Objetivo

Validar manualmente el flujo completo de RepairLab como si fuera a usarse en un taller real. Esta checklist no reemplaza tests automatizados ni auditoria de seguridad; sirve como prueba operacional controlada antes de demos, cambios grandes o uso con datos reales.

## Reglas de la prueba

- Usar datos de prueba claros, por ejemplo cliente `Cliente E2E RepairLab`.
- No usar datos reales de clientes.
- No borrar backups, storage ni datos reales durante la prueba.
- Ejecutar backups desde el host/PowerShell, no desde el contenedor app.
- Registrar cualquier falla con ruta, accion, hora aproximada y captura si aplica.

## 1. Preparacion

1. Confirmar working tree:

```txt
git status --short
```

Resultado esperado: sin cambios inesperados antes de iniciar la prueba. Si hay cambios, documentarlos.

2. Levantar servicios:

```txt
docker compose up -d postgres app
```

3. Revisar servicios:

```txt
docker compose ps
```

Resultado esperado:

- `repair_lab_postgres`: `healthy`.
- `repair_lab_app`: `healthy`.

4. Validar healthcheck:

```txt
curl http://localhost:3000/api/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "database": "ok",
  "storage": "ok"
}
```

5. Confirmar variables basicas:

- `DATABASE_URL` local para host usa `localhost:5432`.
- App dentro de Docker usa `postgres:5432`, no `localhost`.
- `AUTH_SECRET` existe.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` existen.
- `PRIVATE_STORAGE_ROOT` en Docker apunta a `/app/storage/private`.
- `EMAIL_PROVIDER` esta en `console`, `disabled` o provider real controlado.

## 2. Login

1. Abrir:

```txt
http://localhost:3000/login
```

2. Iniciar sesion con usuario admin de prueba.
3. Confirmar acceso a:

```txt
http://localhost:3000/admin
```

Resultado esperado: entra al panel admin sin error y muestra navegacion principal.

## 3. Intake

1. Abrir:

```txt
http://localhost:3000/admin/intake
```

2. Crear cliente de prueba:

- Nombre: `Cliente E2E RepairLab`.
- Telefono: valor de prueba.
- Email: valor de prueba si se quiere validar MessageLog/email console.

3. Crear dispositivo de prueba:

- Tipo: consola, laptop, telefono u otro equipo.
- Marca/modelo: valor reconocible.
- Serial: valor ficticio.

4. Registrar problema:

- Problema reportado.
- Condicion fisica.
- Accesorios recibidos.
- Observaciones internas.

5. Subir una imagen privada de prueba.
6. Guardar recepcion.

Resultado esperado:

- Se crea ticket.
- Se muestra enlace o redireccion al ticket creado.
- El ticket tiene codigo visible.

## 4. Archivos privados

1. Abrir el ticket creado.
2. Confirmar que aparece el archivo/foto privada en la seccion de archivos.
3. Abrir el archivo desde admin mediante ruta similar a:

```txt
/admin/files/[fileAssetId]
```

Resultado esperado: el archivo abre o descarga estando autenticado.

4. Abrir el portal cliente del ticket.
5. Confirmar que el portal cliente NO muestra archivos privados ni links a `/admin/files`.

Resultado esperado: fotos/evidencia privada solo visibles desde admin.

## 5. Ticket lifecycle

Desde el detalle del ticket, validar cambios de estado:

1. `RECEIVED` -> `INITIAL_REVIEW`.
2. `INITIAL_REVIEW` -> `DIAGNOSIS`.
3. `DIAGNOSIS` -> `WAITING_APPROVAL` si aplica flujo manual, o mediante quote enviada.
4. `WAITING_APPROVAL` -> `APPROVED` mediante aprobacion de quote.
5. `APPROVED` -> `REPAIR_IN_PROGRESS`.
6. `REPAIR_IN_PROGRESS` -> `READY_FOR_PICKUP`.
7. Registrar trabajo realizado/resolucion si el sistema lo requiere.
8. `READY_FOR_PICKUP` -> `DELIVERED`.

Resultado esperado:

- Cada cambio valido se permite.
- El timeline muestra eventos humanos.
- No se permiten transiciones incoherentes.

## 6. Quote

1. Abrir cotizaciones del ticket.
2. Crear cotizacion en `DRAFT`.
3. Agregar linea de servicio, repuesto o producto.
4. Confirmar subtotal/total.
5. Enviar cotizacion.
6. Confirmar quote en `SENT`.
7. Aprobar cotizacion.
8. Confirmar quote en `APPROVED`.

Resultado esperado:

- No se puede enviar quote vacia.
- No se puede aprobar quote vacia o con total cero.
- Al enviar, ticket queda esperando aprobacion.
- Al aprobar, ticket queda aprobado/listo para reparacion.

## 7. Invoice

1. Desde ticket o quote aprobada, generar factura.
2. Abrir factura.
3. Confirmar:

- cliente;
- ticket asociado;
- lineas copiadas;
- subtotal;
- total;
- estado de pago.

4. Abrir PDF de factura.

Resultado esperado:

- La factura se genera una sola vez desde la quote aprobada.
- El PDF abre/descarga correctamente.

## 8. Payment

1. En la factura, registrar pago parcial si aplica.
2. Confirmar estado `PARTIALLY_PAID`.
3. Registrar pago restante.
4. Confirmar estado `PAID`.
5. Revisar timeline/eventos del ticket.

Resultado esperado:

- No permite pago mayor al saldo.
- No permite pago cero o negativo.
- Saldo pendiente llega a cero.
- Se registran eventos de pago.

## 9. Inventory

Si ya existe item con inventario controlado:

1. Usar ese item en una quote/factura.
2. Pagar la factura completa.
3. Confirmar movimiento `OUT`.
4. Confirmar reduccion de stock.

Si no existe item de prueba:

1. Abrir:

```txt
http://localhost:3000/admin/catalog
```

2. Crear item `PART` o `PRODUCT`.
3. Activar control de stock.
4. Registrar stock inicial.
5. Usarlo en quote/factura.
6. Pagar factura completa y confirmar descuento.

Resultado esperado:

- Solo items con control de inventario descuentan stock.
- Lineas manuales o servicios no descuentan inventario.
- No se permite stock negativo.

## 10. Portal cliente

1. En el ticket admin, copiar link del portal cliente.
2. Abrir:

```txt
/track/[token]
```

3. Confirmar:

- codigo de ticket visible;
- estado traducido;
- equipo;
- problema reportado;
- timeline publico;
- quote visible si esta enviada/aprobada;
- factura visible si existe;
- saldo/pagos si aplica.

4. Abrir:

```txt
/track/[token]/quote.pdf
/track/[token]/invoice.pdf
```

Resultado esperado:

- PDFs publicos abren solo para el token correcto.
- No se muestran notas internas.
- No se muestran audit logs.
- No se muestran archivos privados.
- No se muestran datos de otros clientes.

## 11. Worker / outbox

Ejecutar:

```txt
docker compose exec -T app npm run worker:events
```

Resultado esperado:

- Procesa eventos pendientes o termina con `0 candidate event(s)`.
- No falla si no hay eventos.
- No imprime secretos ni payloads sensibles completos.

## 12. Backups

Desde host/PowerShell:

```txt
npm run backup
```

Resultado esperado:

- `backup:db`: OK.
- `backup:storage`: OK.
- Se crean archivos bajo `backups/postgres` y `backups/storage`.

Importante:

- No ejecutar `npm run backup` dentro del contenedor app.
- `backup:db` usa `docker exec` desde el host para acceder a `repair_lab_postgres`.
- Dentro del contenedor app no se garantiza Docker CLI ni acceso al Docker socket.

## 13. CI

1. Hacer push o abrir PR hacia `master`.
2. Abrir GitHub Actions.
3. Confirmar workflow `CI` en verde.

Resultado esperado:

- `npm ci`: OK.
- `prisma generate`: OK.
- `prisma validate`: OK.
- `lint`: OK.
- `tsc --noEmit`: OK.
- `npm run test`: OK.

## 14. Tabla checklist

| Area | Accion | Resultado esperado | Estado | Notas |
| --- | --- | --- | --- | --- |
| Preparacion | `git status --short` | Sin cambios inesperados | No probado | |
| Preparacion | `docker compose up -d postgres app` | Servicios levantan | No probado | |
| Preparacion | `docker compose ps` | App y DB healthy | No probado | |
| Healthcheck | `curl /api/health` | `status: ok` | No probado | |
| Login | Entrar a `/login` | Admin accede a `/admin` | No probado | |
| Intake | Crear recepcion | Ticket creado | No probado | |
| Archivos privados | Abrir `/admin/files/[fileAssetId]` | Archivo abre autenticado | No probado | |
| Portal archivos | Revisar `/track/[token]` | No muestra archivos privados | No probado | |
| Ticket lifecycle | Cambiar estados | Timeline coherente | No probado | |
| Quote | Crear, agregar linea, enviar, aprobar | Quote valida y ticket sincronizado | No probado | |
| Invoice | Generar factura desde quote | Factura con lineas y total | No probado | |
| PDF factura | Abrir PDF | PDF descarga/abre | No probado | |
| Payment | Registrar pago parcial/completo | Estado pago correcto | No probado | |
| Inventory | Descontar item controlado | Movimiento OUT y stock actualizado | No probado | |
| Portal cliente | Abrir token y PDFs | Info publica segura | No probado | |
| Worker | `docker compose exec -T app npm run worker:events` | Procesa o termina sin pendientes | No probado | |
| Backups | `npm run backup` desde host | DB y storage OK | No probado | |
| CI | Revisar GitHub Actions | Workflow verde | No probado | |

## 15. Criterios de E2E aprobado

El E2E manual queda aprobado solo si todo esto esta OK:

- Healthcheck OK.
- Login OK.
- Intake OK.
- Archivo privado OK.
- Ticket lifecycle OK.
- Quote OK.
- Invoice OK.
- Payment OK.
- Portal cliente OK.
- PDFs OK.
- Worker OK.
- Backup desde host OK.
- No se expusieron notas internas, audit logs ni archivos privados en portal publico.

## 16. Troubleshooting

### Puerto 3000 ocupado

Sintoma: `docker compose up` levanta app pero puerto no responde o Docker reporta conflicto.

Acciones:

- Cerrar otro `npm run dev`.
- Revisar procesos Node locales.
- Cambiar temporalmente el puerto publicado en Compose solo si es necesario para la prueba.

### Docker no iniciado

Sintoma: comandos Docker fallan al conectar con Docker Desktop.

Acciones:

- Abrir Docker Desktop.
- Esperar a que el engine este running.
- Repetir `docker compose ps`.

### DB no healthy

Sintoma: `repair_lab_postgres` no llega a `healthy`.

Acciones:

- Revisar `docker compose logs postgres`.
- Confirmar volumen y credenciales locales.
- No borrar volumenes sin backup previo.

### Login falla por seed admin

Sintoma: credenciales admin no funcionan.

Acciones:

- Confirmar `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
- Ejecutar seed controlado si corresponde:

```txt
npm run seed:admin
```

o dentro de Docker:

```txt
docker compose exec -T app npm run seed:admin
```

### Backup falla dentro del contenedor

Sintoma: `npm run backup` falla dentro de `app`.

Causa probable: el contenedor app no tiene Docker CLI/socket para ejecutar `docker exec repair_lab_postgres`.

Accion:

- Ejecutar backups desde host/PowerShell.

### Archivo privado no abre

Sintoma: `/admin/files/[fileAssetId]` devuelve error.

Acciones:

- Confirmar sesion admin.
- Confirmar que `FileAsset` existe.
- Confirmar que el archivo fisico existe en `storage/private` o volumen `repair_lab_storage`.
- Revisar que `storageKey` no haya quedado huerfano.

### Portal no tiene token

Sintoma: no existe link `/track/[token]`.

Acciones:

- Confirmar que el ticket fue creado desde intake despues de implementar `publicAccessToken`.
- Revisar en admin si el bloque “Portal cliente” muestra link disponible.
- No usar ID interno de ticket como sustituto del token.
