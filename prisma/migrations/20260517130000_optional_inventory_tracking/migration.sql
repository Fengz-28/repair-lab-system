-- Optional inventory tracking for catalog items.
-- Keeps services/manual lines flexible while allowing real stock control for products/parts.
-- Do not apply without explicit confirmation.

ALTER TABLE "CatalogItem" ADD COLUMN "trackInventory" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "InventoryMovement" ADD COLUMN "notes" TEXT;
