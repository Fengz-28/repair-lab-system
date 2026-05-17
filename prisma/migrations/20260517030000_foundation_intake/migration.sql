-- Foundation intake migration.
-- This expands the initial Customer/Ticket schema without resetting data.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "UserRole" AS ENUM ('admin', 'staff');
CREATE TYPE "PreferredContactMethod" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP', 'NONE');
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PHONE', 'INTERNAL', 'SYSTEM');
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RECEIVED');
CREATE TYPE "DeviceType" AS ENUM ('PHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'CONSOLE', 'ACCESSORY', 'OTHER');
CREATE TYPE "TicketStatus" AS ENUM ('RECEIVED', 'INITIAL_REVIEW', 'DIAGNOSIS', 'WAITING_APPROVAL', 'APPROVED', 'REPAIR_IN_PROGRESS', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED');
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE "InvoiceType" AS ENUM ('QUOTE', 'INVOICE', 'RECEIPT');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID', 'PARTIALLY_PAID', 'UNPAID');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'VOID');
CREATE TYPE "ProductType" AS ENUM ('SERVICE', 'PRODUCT', 'PART');
CREATE TYPE "InventoryMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED');
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC');
CREATE TYPE "IntegrationEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'CANCELLED');
CREATE TYPE "AIInteractionType" AS ENUM ('TICKET_SUMMARY', 'SUGGESTED_REPLY', 'SEMANTIC_SEARCH', 'KNOWLEDGE_INGESTION', 'CONTENT_GENERATION', 'TECHNICAL_ASSISTANCE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'staff',
  "passwordHash" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Customer" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Customer" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Customer" ADD COLUMN "whatsappPhone" TEXT;
ALTER TABLE "Customer" ADD COLUMN "preferredContactMethod" "PreferredContactMethod" NOT NULL DEFAULT 'WHATSAPP';
ALTER TABLE "Customer" ADD COLUMN "notes" TEXT;

UPDATE "Customer"
SET
  "firstName" = COALESCE(NULLIF(split_part("name", ' ', 1), ''), 'Cliente'),
  "lastName" = NULLIF(trim(substr("name", length(split_part("name", ' ', 1)) + 1)), '');

ALTER TABLE "Customer" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Customer" DROP COLUMN "name";

CREATE TABLE "Device" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "type" "DeviceType" NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT,
  "serial" TEXT,
  "color" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Device" ("id", "customerId", "type", "brand", "model", "notes", "createdAt", "updatedAt")
SELECT DISTINCT ON (t."id")
  'legacy-device-' || t."id",
  t."customerId",
  'OTHER',
  'Unknown',
  t."title",
  'Created by migration for a legacy ticket without device data.',
  t."createdAt",
  t."updatedAt"
FROM "Ticket" t;

CREATE TABLE "Intake" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "receivedByUserId" TEXT,
  "accessoriesReceived" TEXT,
  "physicalCondition" TEXT NOT NULL,
  "reportedIssue" TEXT NOT NULL,
  "internalNotes" TEXT,
  "receiptNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Ticket" RENAME COLUMN "code" TO "ticketNumber";
ALTER TABLE "Ticket" ADD COLUMN "deviceId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "intakeId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "createdByUserId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "assignedToId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "reportedIssue" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "diagnosis" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "resolution" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Ticket" ADD COLUMN "closedAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN "statusNew" "TicketStatus" NOT NULL DEFAULT 'RECEIVED';

UPDATE "Ticket"
SET
  "deviceId" = 'legacy-device-' || "id",
  "reportedIssue" = COALESCE("description", "title", 'Legacy ticket'),
  "statusNew" = CASE
    WHEN "status" IN ('RECEIVED', 'INITIAL_REVIEW', 'DIAGNOSIS', 'WAITING_APPROVAL', 'APPROVED', 'REPAIR_IN_PROGRESS', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED')
      THEN "status"::"TicketStatus"
    ELSE 'RECEIVED'::"TicketStatus"
  END;

ALTER TABLE "Ticket" ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN "reportedIssue" SET NOT NULL;
ALTER TABLE "Ticket" DROP COLUMN "description";
ALTER TABLE "Ticket" DROP COLUMN "status";
ALTER TABLE "Ticket" RENAME COLUMN "statusNew" TO "status";

DROP INDEX IF EXISTS "Ticket_code_key";
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");
CREATE UNIQUE INDEX "Ticket_intakeId_key" ON "Ticket"("intakeId");

CREATE TABLE "TicketStatusHistory" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "fromStatus" "TicketStatus",
  "toStatus" "TicketStatus" NOT NULL,
  "changedById" TEXT,
  "internalComment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketComment" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "authorId" TEXT,
  "body" TEXT NOT NULL,
  "isInternal" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketEvent" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "customerId" TEXT,
  "ticketId" TEXT,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "googleCalendarEventId" TEXT,
  "externalCalendarProvider" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CatalogItem" (
  "id" TEXT NOT NULL,
  "type" "ProductType" NOT NULL,
  "sku" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "basePrice" DECIMAL(12,2),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryItem" (
  "id" TEXT NOT NULL,
  "catalogItemId" TEXT NOT NULL,
  "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
  "reorderLevel" INTEGER NOT NULL DEFAULT 0,
  "location" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "type" "InventoryMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "reason" TEXT,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "type" "InvoiceType" NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "customerId" TEXT NOT NULL,
  "ticketId" TEXT,
  "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'CRC',
  "notes" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceItem" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "catalogItemId" TEXT,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "lineTotal" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MessageLog" (
  "id" TEXT NOT NULL,
  "customerId" TEXT,
  "ticketId" TEXT,
  "channel" "CommunicationChannel" NOT NULL,
  "direction" "MessageDirection" NOT NULL,
  "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
  "provider" TEXT,
  "providerMessageId" TEXT,
  "recipient" TEXT,
  "subject" TEXT,
  "body" TEXT,
  "metadata" JSONB,
  "sentAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FileAsset" (
  "id" TEXT NOT NULL,
  "ownerType" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "intakeId" TEXT,
  "ticketId" TEXT,
  "storageKey" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "checksum" TEXT,
  "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" "IntegrationEventStatus" NOT NULL DEFAULT 'PENDING',
  "aggregateType" TEXT,
  "aggregateId" TEXT,
  "payload" JSONB NOT NULL,
  "idempotencyKey" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntegrationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEndpoint" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "url" TEXT,
  "secretRef" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "before" JSONB,
  "after" JSONB,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeDocument" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceUri" TEXT,
  "contentHash" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeChunk" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIInteraction" (
  "id" TEXT NOT NULL,
  "type" "AIInteractionType" NOT NULL,
  "ticketId" TEXT,
  "provider" TEXT,
  "model" TEXT,
  "prompt" TEXT,
  "response" TEXT,
  "metadata" JSONB,
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AIInteraction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");
CREATE INDEX "Customer_whatsappPhone_idx" ON "Customer"("whatsappPhone");
CREATE INDEX "Device_customerId_idx" ON "Device"("customerId");
CREATE INDEX "Device_serial_idx" ON "Device"("serial");
CREATE INDEX "Device_brand_model_idx" ON "Device"("brand", "model");
CREATE UNIQUE INDEX "Intake_receiptNumber_key" ON "Intake"("receiptNumber");
CREATE INDEX "Intake_customerId_idx" ON "Intake"("customerId");
CREATE INDEX "Intake_deviceId_idx" ON "Intake"("deviceId");
CREATE INDEX "Intake_createdAt_idx" ON "Intake"("createdAt");
CREATE INDEX "Ticket_customerId_idx" ON "Ticket"("customerId");
CREATE INDEX "Ticket_deviceId_idx" ON "Ticket"("deviceId");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");
CREATE INDEX "TicketStatusHistory_ticketId_createdAt_idx" ON "TicketStatusHistory"("ticketId", "createdAt");
CREATE INDEX "TicketComment_ticketId_createdAt_idx" ON "TicketComment"("ticketId", "createdAt");
CREATE INDEX "TicketEvent_ticketId_createdAt_idx" ON "TicketEvent"("ticketId", "createdAt");
CREATE INDEX "TicketEvent_type_idx" ON "TicketEvent"("type");
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");
CREATE INDEX "Appointment_ticketId_idx" ON "Appointment"("ticketId");
CREATE INDEX "Appointment_startsAt_idx" ON "Appointment"("startsAt");
CREATE UNIQUE INDEX "CatalogItem_sku_key" ON "CatalogItem"("sku");
CREATE UNIQUE INDEX "InventoryItem_catalogItemId_key" ON "InventoryItem"("catalogItemId");
CREATE INDEX "InventoryMovement_inventoryItemId_createdAt_idx" ON "InventoryMovement"("inventoryItemId", "createdAt");
CREATE INDEX "InventoryMovement_referenceType_referenceId_idx" ON "InventoryMovement"("referenceType", "referenceId");
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_ticketId_idx" ON "Invoice"("ticketId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
CREATE INDEX "MessageLog_customerId_idx" ON "MessageLog"("customerId");
CREATE INDEX "MessageLog_ticketId_idx" ON "MessageLog"("ticketId");
CREATE INDEX "MessageLog_channel_status_idx" ON "MessageLog"("channel", "status");
CREATE INDEX "MessageLog_providerMessageId_idx" ON "MessageLog"("providerMessageId");
CREATE INDEX "FileAsset_ownerType_ownerId_idx" ON "FileAsset"("ownerType", "ownerId");
CREATE INDEX "FileAsset_intakeId_idx" ON "FileAsset"("intakeId");
CREATE INDEX "FileAsset_ticketId_idx" ON "FileAsset"("ticketId");
CREATE UNIQUE INDEX "IntegrationEvent_idempotencyKey_key" ON "IntegrationEvent"("idempotencyKey");
CREATE INDEX "IntegrationEvent_type_status_idx" ON "IntegrationEvent"("type", "status");
CREATE INDEX "IntegrationEvent_aggregateType_aggregateId_idx" ON "IntegrationEvent"("aggregateType", "aggregateId");
CREATE INDEX "IntegrationEvent_availableAt_idx" ON "IntegrationEvent"("availableAt");
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");
CREATE INDEX "AIInteraction_ticketId_idx" ON "AIInteraction"("ticketId");
CREATE INDEX "AIInteraction_type_createdAt_idx" ON "AIInteraction"("type", "createdAt");

ALTER TABLE "Device" ADD CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketStatusHistory" ADD CONSTRAINT "TicketStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TicketStatusHistory" ADD CONSTRAINT "TicketStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketEvent" ADD CONSTRAINT "TicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "Intake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AIInteraction" ADD CONSTRAINT "AIInteraction_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
