# Windows build notes

## Estado actual

Para el modulo fundacional de recepcion, las verificaciones suficientes por ahora son:

- `prisma validate`: aprobado.
- `tsc --noEmit`: aprobado.
- `eslint`: aprobado.

No se aplicaron migraciones.

## Problema observado con Turbopack

Al ejecutar `next build` en Windows, Turbopack fallo durante el procesamiento de `src/app/globals.css` con:

```txt
Failed to write app endpoint /page
creating new process
spawning node pooled process
Acceso denegado. (os error 5)
```

Antes de fijar el root, Next tambien detecto un lockfile padre:

```txt
Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected the directory of C:\Users\PC MASTER\package-lock.json as the root directory.
Detected additional lockfiles:
  * C:\Users\PC MASTER\repair-lab-system\package-lock.json
```

Se agrego en `next.config.ts`:

```ts
turbopack: {
  root: process.cwd(),
}
```

Esto corrige la inferencia de root, pero el error de permisos al crear procesos hijos de Turbopack persiste en este entorno.

## Decision temporal

No repetir build con permisos elevados por ahora. Para esta etapa, `tsc`, `eslint` y `prisma validate` son suficientes para validar el contrato del modulo.

## Opciones futuras

- Revisar por que existe `C:\Users\PC MASTER\package-lock.json` y si debe eliminarse o mantenerse.
- Probar build desde una terminal normal fuera del sandbox.
- Probar `next build --webpack` como verificacion alternativa si Turbopack sigue fallando.
- Revisar antivirus, permisos de WindowsApps, ejecucion de procesos hijos y politicas del directorio del usuario.

