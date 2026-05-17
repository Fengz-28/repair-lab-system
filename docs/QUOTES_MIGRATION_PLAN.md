# Quotes migration plan

## Objetivo

Extender la base `Invoice`/`InvoiceItem` para soportar cotizaciones/estimates asociadas a tickets, con flujo de aprobacion futuro y sin implementar pagos ni facturacion completa.

## Cambio propuesto

Migracion: `20260517050000_quotes_foundation`

Cambios:

- Agrega `EXPIRED` a `InvoiceStatus`.
- Agrega `Invoice.customerNotes`.
- Agrega `Invoice.internalNotes`.
- Agrega `Invoice.approvalToken`.
- Agrega `Invoice.approvalExpiresAt`.
- Agrega `InvoiceItem.itemType`.
- Agrega unique index para `Invoice.approvalToken`.

## Seguridad

- No borra datos.
- No cambia montos existentes.
- `InvoiceItem.itemType` usa default `SERVICE` para filas antiguas.
- No se aplica automaticamente.

## Comando futuro

```powershell
node .\node_modules\prisma\build\index.js migrate dev
```

