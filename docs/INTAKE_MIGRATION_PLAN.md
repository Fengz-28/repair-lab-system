# Intake migration plan

## Objetivo

Migrar desde la base inicial minima (`Customer.name`, `Ticket.code`, `Ticket.status` como texto) hacia el schema fundacional extensible sin resetear la base.

## Estrategia segura

- No usar `prisma migrate reset`.
- Preservar clientes existentes convirtiendo `Customer.name` en `firstName` y `lastName`.
- Preservar tickets existentes renombrando `Ticket.code` a `ticketNumber`.
- Convertir `Ticket.status` textual al enum `TicketStatus`; valores desconocidos pasan a `RECEIVED`.
- Crear un `Device` placeholder para tickets legacy porque el nuevo modelo requiere equipo.
- Crear tablas nuevas para intake, auditoria, historial, eventos, archivos privados e integraciones.
- Aplicar primero en ambiente local con backup o volumen descartable.

## Comando recomendado

```powershell
node .\node_modules\prisma\build\index.js migrate dev
```

Si Prisma no encuentra `node`, usar el runtime bundled de Codex o instalar Node/npm en PATH.

## Validaciones post-migracion

- `prisma validate`
- `tsc --noEmit`
- crear una recepcion de prueba desde `/admin/intake`
- verificar registros en `Customer`, `Device`, `Intake`, `Ticket`, `TicketStatusHistory`, `TicketEvent`, `FileAsset`, `AuditLog` e `IntegrationEvent`

