# RepairLab - Backup and Restore

Actualizado: 2026-05-26, America/Costa_Rica.

## Alcance

Esta es una estrategia local minima para reducir riesgo de perdida de datos en desarrollo o demo controlada. No reemplaza backups productivos externos, monitoreados y probados.

Incluye:

- Backup de PostgreSQL local en Docker.
- Backup de `storage/private`.
- Documentacion basica de restore manual.

No incluye:

- Backups remotos.
- S3/MinIO.
- Cron del sistema operativo.
- Encriptacion automatica.
- Retencion/rotacion automatica.
- Restore automatizado seguro.

## Rutas locales

```txt
backups/
  postgres/
  storage/
```

La carpeta `backups/` esta ignorada por Git salvo `.gitkeep`.

## Backup de base de datos

Ejecutar:

```txt
npm run backup:db
```

El script:

- lee `DATABASE_URL`;
- usa `docker exec repair_lab_postgres pg_dump`;
- no imprime secretos;
- genera un archivo comprimido `.sql.gz`;
- guarda el resultado en `backups/postgres`.

Requisito:

- Docker Desktop debe estar abierto.
- El contenedor `repair_lab_postgres` debe estar activo.

## Backup de storage privado

Ejecutar:

```txt
npm run backup:storage
```

El script:

- lee `PRIVATE_STORAGE_ROOT`;
- usa `tar` para generar `.tar.gz`;
- guarda el resultado en `backups/storage`;
- si no existe storage o esta vacio, crea un marcador `.txt` y termina OK.

## Backup completo

Ejecutar:

```txt
npm run backup
```

Ejecuta:

```txt
npm run backup:db
npm run backup:storage
```

Si una parte falla, el resumen indica cual fallo y el comando termina con error.

## Restore manual de PostgreSQL

Advertencia: no restaurar encima de datos reales sin sacar antes una copia actual.

Pasos sugeridos para desarrollo local:

1. Detener la app Next si esta corriendo.
2. Crear backup actual antes de tocar datos.
3. Descomprimir el `.sql.gz` deseado.
4. Restaurar con `psql` dentro del contenedor.

Ejemplo conceptual en PowerShell:

```txt
gzip -d -k backups/postgres/repairlab-postgres-YYYY-MM-DDTHH-MM-SS.sql.gz
Get-Content backups/postgres/repairlab-postgres-YYYY-MM-DDTHH-MM-SS.sql | docker exec -i repair_lab_postgres psql -U repairlab -d repairlab
```

Si la base ya tiene datos, puede ser necesario recrearla o limpiar tablas antes. Esa decision debe tomarse conscientemente.

## Restore manual de storage

Advertencia: no sobrescribir `storage/private` sin copia previa.

Pasos sugeridos:

1. Detener la app.
2. Renombrar el storage actual:

```txt
storage/private -> storage/private.before-restore
```

3. Extraer el `.tar.gz` de `backups/storage` hacia `storage/`.
4. Confirmar que queda `storage/private`.
5. Levantar la app y probar `/admin/files/[fileAssetId]`.

## Produccion

Para produccion real se requiere:

- Backups automatizados externos.
- Retencion definida.
- Cifrado en reposo.
- Pruebas periodicas de restore.
- Alertas si falla backup.
- Backup conjunto DB + storage de la misma ventana temporal.

