import { Prisma, TicketStatus } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";
import { preparePrivateTicketAttachment } from "@/server/storage/private-ticket-attachment-placeholder";

import type {
  AddInternalCommentInput,
  ChangeTicketStatusInput,
  TicketAttachmentPlaceholderInput,
  UpdateTechnicalNotesInput,
} from "./ticket.lifecycle.schema";

export const ticketStatusTransitions: Record<TicketStatus, TicketStatus[]> = {
  RECEIVED: [TicketStatus.INITIAL_REVIEW],
  INITIAL_REVIEW: [TicketStatus.DIAGNOSIS],
  DIAGNOSIS: [TicketStatus.WAITING_APPROVAL],
  WAITING_APPROVAL: [TicketStatus.APPROVED, TicketStatus.CANCELLED],
  APPROVED: [TicketStatus.REPAIR_IN_PROGRESS],
  REPAIR_IN_PROGRESS: [TicketStatus.READY_FOR_PICKUP],
  READY_FOR_PICKUP: [TicketStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

export const finalTicketStatuses = new Set<TicketStatus>([
  TicketStatus.DELIVERED,
  TicketStatus.CANCELLED,
]);

export function getAllowedNextStatuses(status: TicketStatus) {
  return ticketStatusTransitions[status] ?? [];
}

export function canTransitionTicketStatus(from: TicketStatus, to: TicketStatus) {
  return getAllowedNextStatuses(from).includes(to);
}

export async function changeTicketStatus(
  input: ChangeTicketStatusInput,
  actorUserId?: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: input.ticketId },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        customerId: true,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    if (!canTransitionTicketStatus(ticket.status, input.nextStatus)) {
      throw new Error(`Invalid ticket transition: ${ticket.status} -> ${input.nextStatus}.`);
    }

    const updatedTicket = await tx.ticket.update({
      where: { id: ticket.id },
      data: {
        status: input.nextStatus,
        closedAt: finalTicketStatuses.has(input.nextStatus) ? new Date() : null,
      },
    });

    await tx.ticketStatusHistory.create({
      data: {
        ticketId: ticket.id,
        fromStatus: ticket.status,
        toStatus: input.nextStatus,
        changedById: actorUserId ?? null,
        internalComment: input.internalComment,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "ticket.status_changed",
        payload: {
          fromStatus: ticket.status,
          toStatus: input.nextStatus,
          internalComment: input.internalComment ?? null,
        },
      },
    });

    await tx.integrationEvent.create({
      data: {
        type: integrationEventForStatus(input.nextStatus),
        aggregateType: "Ticket",
        aggregateId: ticket.id,
        payload: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          customerId: ticket.customerId,
          fromStatus: ticket.status,
          toStatus: input.nextStatus,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: actorUserId ?? null,
      action: "ticket.status_changed",
      entityType: "Ticket",
      entityId: ticket.id,
      before: {
        status: ticket.status,
      },
      after: {
        status: updatedTicket.status,
        closedAt: updatedTicket.closedAt?.toISOString() ?? null,
      },
      metadata: {
        ticketNumber: ticket.ticketNumber,
        internalComment: input.internalComment ?? null,
      },
    });

    return updatedTicket;
  });
}

export async function addInternalComment(
  input: AddInternalCommentInput,
  actorUserId?: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: input.ticketId },
      select: {
        id: true,
        ticketNumber: true,
        customerId: true,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const comment = await tx.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: actorUserId ?? null,
        body: input.body,
        isInternal: true,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "ticket.comment_added",
        payload: {
          commentId: comment.id,
          isInternal: true,
        },
      },
    });

    await tx.integrationEvent.create({
      data: {
        type: "ticket.comment_added",
        aggregateType: "Ticket",
        aggregateId: ticket.id,
        payload: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          customerId: ticket.customerId,
          commentId: comment.id,
          isInternal: true,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: actorUserId ?? null,
      action: "ticket.comment_added",
      entityType: "TicketComment",
      entityId: comment.id,
      after: {
        ticketId: ticket.id,
        isInternal: true,
      },
      metadata: {
        ticketNumber: ticket.ticketNumber,
      },
    });

    return comment;
  });
}

export async function updateTechnicalNotes(
  input: UpdateTechnicalNotesInput,
  actorUserId?: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: input.ticketId },
      select: {
        id: true,
        ticketNumber: true,
        diagnosis: true,
        resolution: true,
        internalNotes: true,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const updatedTicket = await tx.ticket.update({
      where: { id: ticket.id },
      data: {
        diagnosis: input.diagnosis ?? null,
        resolution: input.resolution ?? null,
        internalNotes: input.internalNotes ?? null,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "ticket.technical_note_added",
        payload: {
          hasDiagnosis: Boolean(input.diagnosis),
          hasResolution: Boolean(input.resolution),
          hasInternalNotes: Boolean(input.internalNotes),
        },
      },
    });

    await tx.integrationEvent.create({
      data: {
        type: "ticket.technical_note_added",
        aggregateType: "Ticket",
        aggregateId: ticket.id,
        payload: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: actorUserId ?? null,
      action: "ticket.technical_notes_updated",
      entityType: "Ticket",
      entityId: ticket.id,
      before: {
        diagnosis: ticket.diagnosis,
        resolution: ticket.resolution,
        internalNotes: ticket.internalNotes,
      },
      after: {
        diagnosis: updatedTicket.diagnosis,
        resolution: updatedTicket.resolution,
        internalNotes: updatedTicket.internalNotes,
      },
      metadata: {
        ticketNumber: ticket.ticketNumber,
      },
    });

    return updatedTicket;
  });
}

export async function addTicketAttachmentPlaceholder(
  input: TicketAttachmentPlaceholderInput,
  actorUserId?: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: input.ticketId },
      select: {
        id: true,
        ticketNumber: true,
        intakeId: true,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const preparedAttachment = preparePrivateTicketAttachment(ticket.id, input);

    const fileAsset = await tx.fileAsset.create({
      data: {
        ownerType: "Ticket",
        ownerId: ticket.id,
        ticketId: ticket.id,
        intakeId: ticket.intakeId,
        storageKey: preparedAttachment.storageKey,
        originalName: preparedAttachment.originalName,
        mimeType: preparedAttachment.mimeType,
        byteSize: preparedAttachment.byteSize,
        visibility: "PRIVATE",
        metadata: {
          placeholder: true,
          storage: "private-placeholder",
          source: "ticket-lifecycle",
        } satisfies Prisma.InputJsonValue,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "ticket.attachment_added",
        payload: {
          fileAssetId: fileAsset.id,
          originalName: fileAsset.originalName,
          placeholder: true,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: actorUserId ?? null,
      action: "ticket.attachment_added",
      entityType: "FileAsset",
      entityId: fileAsset.id,
      after: {
        ticketId: ticket.id,
        visibility: fileAsset.visibility,
        placeholder: true,
      },
      metadata: {
        ticketNumber: ticket.ticketNumber,
      },
    });

    return fileAsset;
  });
}

function integrationEventForStatus(status: TicketStatus) {
  if (status === TicketStatus.READY_FOR_PICKUP) {
    return "ticket.ready_for_pickup";
  }

  if (status === TicketStatus.DELIVERED) {
    return "ticket.delivered";
  }

  return "ticket.status_changed";
}

