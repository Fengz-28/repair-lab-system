import { Prisma, TicketStatus } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";
import { preparePrivateIntakePhoto } from "@/server/storage/private-upload-placeholder";

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

  return prisma.$transaction(async (tx) => {
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
        internalComment: "Ticket creado automaticamente desde recepcion.",
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

    if (input.photos.length > 0) {
      await tx.fileAsset.createMany({
        data: input.photos.map((photo, index) => {
          const preparedPhoto = preparePrivateIntakePhoto(intake.id, index, photo);

          return {
            ownerType: "Intake",
            ownerId: intake.id,
            intakeId: intake.id,
            ticketId: ticket.id,
            storageKey: preparedPhoto.storageKey,
            originalName: preparedPhoto.originalName,
            mimeType: preparedPhoto.mimeType,
            byteSize: preparedPhoto.byteSize,
            visibility: "PRIVATE" as const,
            metadata: {
              placeholder: true,
              storage: "private-placeholder",
            } satisfies Prisma.InputJsonValue,
          };
        }),
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
        photoCount: input.photos.length,
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

