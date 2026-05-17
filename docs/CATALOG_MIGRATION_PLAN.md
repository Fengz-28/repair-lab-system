# Catalog migration plan

## Objetivo

Extender `CatalogItem` para soportar categoria, costo, precios tipo "desde" y duracion estimada sin crear ecommerce ni pagos.

## Cambio propuesto

Migracion: `20260517040000_catalog_pricing_inventory`

Campos agregados:

- `category TEXT`
- `costPrice DECIMAL(12,2)`
- `priceStartsAt BOOLEAN NOT NULL DEFAULT false`
- `estimatedDurationMinutes INTEGER`

Indices agregados:

- `CatalogItem_type_idx`
- `CatalogItem_category_idx`
- `CatalogItem_isActive_idx`

## Seguridad

- No borra datos.
- No cambia columnas existentes.
- No requiere backfill obligatorio.
- No se aplica automaticamente.

## Comando futuro

```powershell
node .\node_modules\prisma\build\index.js migrate dev
```

