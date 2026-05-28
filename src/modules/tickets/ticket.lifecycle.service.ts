import { InvoiceStatus, InvoiceType, Prisma, TicketStatus } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";
import {
  deletePrivateFile,
  savePrivateFile,
  validateUploadFile,
} from "@/server/storage/private-storage";
import {
  buildPublicInvoicePdfUrl,
  buildPublicPortalUrl,
} from "@/modules/email/email.service";
import { registerEmailNotificationPlaceholder } from "@/modules/notifications/notification.service";

import type {
  AddInternalCommentInput,
  ChangeTicketStatusInput,
  TicketAttachmentPlaceholderInput,
  UpdateTechnicalNotesInput,
} from "./ticket.lifecycle.schema";
export {
  canTransitionTicketStatus,
  finalTicketStatuses,
  getAllowedNextStatuses,
  ticketStatusTransitions,
} from "./ticket.rules";
import {
  assertCanTransitionTicketStatus,
  finalTicketStatuses,
} from "./ticket.rules";

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
        publicAccessToken: true,
        status: true,
        customerId: true,
        reportedIssue: true,
        diagnosis: true,
        resolution: true,
        internalNotes: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        device: {
          select: {
            brand: true,
            model: true,
          },
        },
        invoices: {
          where: {
            type: {
              in: [InvoiceType.QUOTE, InvoiceType.INVOICE],
            },
          },
          select: {
            type: true,
            status: true,
            total: true,
            currency: true,
            payments: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    assertCanTransitionTicketStatus(ticket.status, input.nextStatus);

    assertTicketOperationalRequirements(ticket, input.nextStatus);

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

    await registerEmailNotificationPlaceholder(tx, {
      template: notificationTemplateForStatus(input.nextStatus),
      recipient: {
        customerId: ticket.customerId,
        ticketId: ticket.id,
        email: ticket.customer.email ?? undefined,
      },
      data: {
        customerName: `${ticket.customer.firstName} ${ticket.customer.lastName ?? ""}`.trim(),
        ticketNumber: ticket.ticketNumber,
        deviceLabel: `${ticket.device.brand}${ticket.device.model ? ` ${ticket.device.model}` : ""}`,
        reportedIssue: ticket.reportedIssue,
        fromStatus: ticket.status,
        toStatus: input.nextStatus,
        toStatusLabel: ticketStatusLabel(input.nextStatus),
        portalUrl: buildPublicPortalUrl(ticket.publicAccessToken),
        ...invoiceEmailData(ticket),
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

function assertTicketOperationalRequirements(
  ticket: {
    status: TicketStatus;
    resolution: string | null;
    invoices: { status: InvoiceStatus }[];
  },
  nextStatus: TicketStatus,
) {
  if (nextStatus === TicketStatus.REPAIR_IN_PROGRESS) {
    const hasApprovedQuote = ticket.invoices.some(
      (invoice) => invoice.status === InvoiceStatus.APPROVED,
    );

    if (!hasApprovedQuote) {
      throw new Error("No se puede iniciar reparación sin una cotización aprobada.");
    }
  }

  if (nextStatus === TicketStatus.DELIVERED && !ticket.resolution?.trim()) {
    throw new Error("Registra el trabajo realizado antes de cerrar el ticket.");
  }
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
  validateUploadFile(input);
  const savedAttachment = await savePrivateFile("tickets", input);

  try {
    return await prisma.$transaction(async (tx) => {
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

    const fileAsset = await tx.fileAsset.create({
      data: {
        ownerType: "Ticket",
        ownerId: ticket.id,
        ticketId: ticket.id,
        intakeId: ticket.intakeId,
        storageKey: savedAttachment.storageKey,
        originalName: savedAttachment.originalName,
        mimeType: savedAttachment.mimeType,
        byteSize: savedAttachment.byteSize,
        checksum: savedAttachment.checksum,
        visibility: "PRIVATE",
        metadata: {
          storage: "local-private",
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
          storage: "local-private",
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
        storage: "local-private",
      },
      metadata: {
        ticketNumber: ticket.ticketNumber,
      },
    });

    return fileAsset;
    });
  } catch (error) {
    await deletePrivateFile(savedAttachment.storageKey);
    throw error;
  }
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

function notificationTemplateForStatus(status: TicketStatus) {
  if (status === TicketStatus.READY_FOR_PICKUP) {
    return "ticket.ready_for_pickup" as const;
  }

  if (status === TicketStatus.DELIVERED) {
    return "ticket.delivered" as const;
  }

  return "ticket.status_changed" as const;
}

function invoiceEmailData(ticket: {
  publicAccessToken: string;
  invoices: {
    type: InvoiceType;
    total: Prisma.Decimal;
    currency: string;
    payments: { amount: Prisma.Decimal }[];
  }[];
}) {
  const invoice = ticket.invoices.find((item) => item.type === InvoiceType.INVOICE);

  if (!invoice) {
    return {};
  }

  const paidTotal = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balanceDue = Math.max(Number(invoice.total) - paidTotal, 0);

  return {
    currency: invoice.currency,
    balanceDue: balanceDue.toFixed(2),
    invoicePdfUrl: buildPublicInvoicePdfUrl(ticket.publicAccessToken),
  };
}

function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revision inicial",
    DIAGNOSIS: "En diagnóstico",
    WAITING_APPROVAL: "Esperando aprobación",
    APPROVED: "Aprobado",
    REPAIR_IN_PROGRESS: "En reparación",
    READY_FOR_PICKUP: "Listo para entrega",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}
