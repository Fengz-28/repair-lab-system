import { randomBytes } from "crypto";

import { Prisma, TicketStatus } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";
import {
  deletePrivateFiles,
  savePrivateFile,
  validateUploadFile,
} from "@/server/storage/private-storage";
import { registerEmailNotificationPlaceholder } from "@/modules/notifications/notification.service";
import { createReceptionReceiptPlaceholder } from "@/modules/receipts/receipt.service";
import { buildPublicPortalUrl } from "@/modules/email/email.service";

import type { CreateIntakeInput } from "./intake.schema";

export type ReceiveDeviceResult = {
  customerId: string;
  deviceId: string;
  intakeId: string;
  ticketId: string;
  ticketNumber: string;
  receiptNumber: string;
};

type ReceiveDeviceOptions = {
  actorUserId?: string | null;
};

export async function receiveDeviceForRepair(
  input: CreateIntakeInput,
  options: ReceiveDeviceOptions = {},
): Promise<ReceiveDeviceResult> {
  const issuedNumbers = createReceptionNumbers();
  input.photos.forEach(validateUploadFile);
  const savedPhotos = await Promise.all(
    input.photos.map((photo) => savePrivateFile("intakes", photo)),
  );

  try {
    return await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: input.customer,
    });

    const device = await tx.device.create({
      data: {
        ...input.device,
        customerId: customer.id,
      },
    });

    const intake = await tx.intake.create({
      data: {
        ...input.intake,
        customerId: customer.id,
        deviceId: device.id,
        receivedByUserId: options.actorUserId ?? null,
        receiptNumber: issuedNumbers.receiptNumber,
      },
    });

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber: issuedNumbers.ticketNumber,
        publicAccessToken: createPublicAccessToken(),
        customerId: customer.id,
        deviceId: device.id,
        intakeId: intake.id,
        createdByUserId: options.actorUserId ?? null,
        status: TicketStatus.RECEIVED,
        title: `${device.brand}${device.model ? ` ${device.model}` : ""}`,
        reportedIssue: input.intake.reportedIssue,
        internalNotes: input.intake.internalNotes,
      },
    });

    await tx.ticketStatusHistory.create({
      data: {
        ticketId: ticket.id,
        fromStatus: null,
        toStatus: TicketStatus.RECEIVED,
        changedById: options.actorUserId ?? null,
        internalComment: "Ticket creado automáticamente desde recepción.",
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "ticket.created",
        payload: {
          source: "intake",
          intakeId: intake.id,
          status: TicketStatus.RECEIVED,
        },
      },
    });

    if (savedPhotos.length > 0) {
      await tx.fileAsset.createMany({
        data: savedPhotos.map((photo) => ({
            ownerType: "Intake",
            ownerId: intake.id,
            intakeId: intake.id,
            ticketId: ticket.id,
            storageKey: photo.storageKey,
            originalName: photo.originalName,
            mimeType: photo.mimeType,
            byteSize: photo.byteSize,
            checksum: photo.checksum,
            visibility: "PRIVATE" as const,
            metadata: {
              storage: "local-private",
              source: "intake",
            } satisfies Prisma.InputJsonValue,
          })),
      });
    }

    await tx.integrationEvent.create({
      data: {
        type: "ticket.created",
        aggregateType: "Ticket",
        aggregateId: ticket.id,
        idempotencyKey: `ticket.created:${ticket.id}`,
        payload: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          intakeId: intake.id,
          customerId: customer.id,
          deviceId: device.id,
        },
      },
    });

    const customerName = `${customer.firstName} ${customer.lastName ?? ""}`.trim();
    const deviceLabel = `${device.brand}${device.model ? ` ${device.model}` : ""}`;

    await createReceptionReceiptPlaceholder(tx, {
      actorUserId: options.actorUserId ?? null,
      customerId: customer.id,
      ticketId: ticket.id,
      receipt: {
        receiptNumber: intake.receiptNumber ?? issuedNumbers.receiptNumber,
        ticketNumber: ticket.ticketNumber,
        customerName,
        deviceLabel,
        reportedIssue: intake.reportedIssue,
        physicalCondition: intake.physicalCondition,
        accessoriesReceived: intake.accessoriesReceived ?? undefined,
        receivedAt: intake.createdAt,
      },
    });

    await registerEmailNotificationPlaceholder(tx, {
      template: "intake.received",
      recipient: {
        customerId: customer.id,
        ticketId: ticket.id,
        email: customer.email ?? undefined,
      },
      data: {
        customerName,
        ticketNumber: ticket.ticketNumber,
        deviceLabel,
        reportedIssue: ticket.reportedIssue,
        receiptNumber: intake.receiptNumber ?? issuedNumbers.receiptNumber,
        receivedAt: intake.createdAt.toLocaleString("es-CR"),
        portalUrl: buildPublicPortalUrl(ticket.publicAccessToken),
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "intake.created",
      entityType: "Intake",
      entityId: intake.id,
      after: {
        customerId: customer.id,
        deviceId: device.id,
        ticketId: ticket.id,
        receiptNumber: intake.receiptNumber,
        photoCount: savedPhotos.length,
      },
      metadata: {
        module: "intake",
        ticketNumber: ticket.ticketNumber,
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "ticket.created",
      entityType: "Ticket",
      entityId: ticket.id,
      after: {
        status: ticket.status,
        ticketNumber: ticket.ticketNumber,
        intakeId: intake.id,
      },
      metadata: {
        module: "tickets",
        source: "intake",
      },
    });

      return {
      customerId: customer.id,
      deviceId: device.id,
      intakeId: intake.id,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      receiptNumber: intake.receiptNumber ?? issuedNumbers.receiptNumber,
    };
    });
  } catch (error) {
    await deletePrivateFiles(savedPhotos.map((photo) => photo.storageKey));
    throw error;
  }
}

function createReceptionNumbers() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return {
    receiptNumber: `R-${datePart}-${suffix}`,
    ticketNumber: `T-${datePart}-${suffix}`,
  };
}

function createPublicAccessToken() {
  return randomBytes(32).toString("base64url");
}
