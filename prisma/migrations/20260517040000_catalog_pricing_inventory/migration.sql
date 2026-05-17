-- Catalog, pricing and inventory foundation.
-- Safe incremental migration: adds nullable commercial fields and indexes.
-- Do not apply without explicit confirmation.

ALTER TABLE "CatalogItem" ADD COLUMN "category" TEXT;
ALTER TABLE "CatalogItem" ADD COLUMN "costPrice" DECIMAL(12,2);
ALTER TABLE "CatalogItem" ADD COLUMN "priceStartsAt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CatalogItem" ADD COLUMN "estimatedDurationMinutes" INTEGER;

CREATE INDEX "CatalogItem_type_idx" ON "CatalogItem"("type");
CREATE INDEX "CatalogItem_category_idx" ON "CatalogItem"("category");
CREATE INDEX "CatalogItem_isActive_idx" ON "CatalogItem"("isActive");

