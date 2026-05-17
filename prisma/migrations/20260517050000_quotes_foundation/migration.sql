-- Quotes / estimates foundation.
-- Safe incremental migration: extends invoice structures for quote approval placeholders.
-- Do not apply without explicit confirmation.

ALTER TYPE "InvoiceStatus" ADD VALUE 'EXPIRED';

ALTER TABLE "Invoice" ADD COLUMN "customerNotes" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "approvalToken" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "approvalExpiresAt" TIMESTAMP(3);

ALTER TABLE "InvoiceItem" ADD COLUMN "itemType" "ProductType" NOT NULL DEFAULT 'SERVICE';

CREATE UNIQUE INDEX "Invoice_approvalToken_key" ON "Invoice"("approvalToken");

