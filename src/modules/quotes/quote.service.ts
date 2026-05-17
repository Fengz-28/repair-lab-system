import { createHash, randomBytes } from "crypto";
import {
  InvoiceStatus,
  InvoiceType,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { registerEmailNotificationPlaceholder } from "@/modules/notifications/notification.service";
import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";

import { canTransitionQuoteStatus } from "./quote.lifecycle";
import type { AddQuoteItemInput, ChangeQuoteStatusInput, CreateQuoteInput } from "./quote.schema";

type QuoteOptions = {
  actorUserId?: string | null;
};

export async function createQuote(input: CreateQuoteInput, options: QuoteOptions = {}) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: input.ticketId },
      include: {
        customer: true,
      },
    });

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const quoteNumber = createQuoteNumber();
    const approvalToken = createApprovalToken(quoteNumber);
    const approvalExpiresAt = new Date();
    approvalExpiresAt.setDate(approvalExpiresAt.getDate() + input.expiresInDays);

    const quote = await tx.invoice.create({
      data: {
        invoiceNumber: quoteNumber,
        type: InvoiceType.QUOTE,
        status: InvoiceStatus.DRAFT,
        paymentStatus: PaymentStatus.UNPAID,
        customerId: ticket.customerId,
        ticketId: ticket.id,
        subtotal: 0,
        taxTotal: 0,
        total: 0,
        currency: "CRC",
        notes: input.customerNotes,
        customerNotes: input.customerNotes,
        internalNotes: input.internalNotes,
        approvalToken,
        approvalExpiresAt,
      },
    });

    await tx.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: "quote.created",
        payload: {
          quoteId: quote.id,
          quoteNumber: quote.invoiceNumber,
          status: quote.status,
        },
      },
    });

    await tx.integrationEvent.create({
      data: {
        type: "quote.created",
        aggregateType: "Invoice",
        aggregateId: quote.id,
        payload: {
          quoteId: quote.id,
          quoteNumber: quote.invoiceNumber,
          ticketId: ticket.id,
          customerId: ticket.customerId,
          approvalPlaceholder: true,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "quote.created",
      entityType: "Invoice",
      entityId: quote.id,
      after: {
        quoteNumber: quote.invoiceNumber,
        type: quote.type,
        status: quote.status,
        ticketId: ticket.id,
        approvalExpiresAt: quote.approvalExpiresAt?.toISOString() ?? null,
      },
      metadata: {
        module: "quotes",
        ticketNumber: ticket.ticketNumber,
      },
    });

    return quote;
  });
}

export async function addQuoteItem(input: AddQuoteItemInput, options: QuoteOptions = {}) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.invoice.findUnique({
      where: { id: input.quoteId },
      include: {
        ticket: true,
      },
    });

    if (!quote || quote.type !== InvoiceType.QUOTE) {
      throw new Error("Quote not found.");
    }

    if (!quote.ticketId) {
      throw new Error("Quote is not linked to a ticket.");
    }

    if (quote.status !== InvoiceStatus.DRAFT) {
      throw new Error("Only draft quotes can be edited.");
    }

    const catalogItem = input.catalogItemId
      ? await tx.catalogItem.findUnique({
          where: { id: input.catalogItemId },
          include: {
            inventoryItem: true,
          },
        })
      : null;

    if (input.catalogItemId && !catalogItem) {
      throw new Error("Catalog item not found.");
    }

    if (catalogItem && !catalogItem.isActive) {
      throw new Error("Catalog item is inactive.");
    }

    const itemType = catalogItem?.type ?? input.itemType;
    const unitPrice = input.unitPrice ?? Number(catalogItem?.basePrice);

    if (!Number.isFinite(unitPrice)) {
      throw new Error("Unit price is required for manual quote items.");
    }

    const lineTotal = input.quantity * unitPrice;

    const item = await tx.invoiceItem.create({
      data: {
        invoiceId: quote.id,
        catalogItemId: catalogItem?.id,
        itemType,
        description: input.description,
        quantity: input.quantity,
        unitPrice,
        lineTotal,
      },
    });

    const totals = await recalculateQuoteTotals(tx, quote.id);

    await tx.ticketEvent.create({
      data: {
        ticketId: quote.ticketId,
        type: "quote.item_added",
        payload: {
          quoteId: quote.id,
          quoteItemId: item.id,
          itemType,
          catalogItemId: catalogItem?.id ?? null,
          lineTotal,
        },
      },
    });

    await tx.integrationEvent.create({
      data: {
        type: "quote.updated",
        aggregateType: "Invoice",
        aggregateId: quote.id,
        payload: {
          quoteId: quote.id,
          quoteItemId: item.id,
          subtotal: totals.subtotal,
          total: totals.total,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "quote.item_added",
      entityType: "InvoiceItem",
      entityId: item.id,
      after: {
        quoteId: quote.id,
        itemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        lineTotal: item.lineTotal.toString(),
      },
      metadata: {
        module: "quotes",
        quoteNumber: quote.invoiceNumber,
      },
    });

    return item;
  });
}

export async function changeQuoteStatus(input: ChangeQuoteStatusInput, options: QuoteOptions = {}) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.invoice.findUnique({
      where: { id: input.quoteId },
      include: {
        customer: true,
        ticket: {
          include: {
            device: true,
          },
        },
      },
    });

    if (!quote || quote.type !== InvoiceType.QUOTE) {
      throw new Error("Quote not found.");
    }

    if (!canTransitionQuoteStatus(quote.status, input.nextStatus)) {
      throw new Error(`Invalid quote transition: ${quote.status} -> ${input.nextStatus}.`);
    }

    const updatedQuote = await tx.invoice.update({
      where: { id: quote.id },
      data: {
        status: input.nextStatus,
        sentAt: input.nextStatus === InvoiceStatus.SENT ? new Date() : quote.sentAt,
        approvedAt:
          input.nextStatus === InvoiceStatus.APPROVED ? new Date() : quote.approvedAt,
        rejectedAt:
          input.nextStatus === InvoiceStatus.REJECTED ? new Date() : quote.rejectedAt,
      },
    });

    const eventType = quoteEventForStatus(input.nextStatus);

    if (quote.ticketId) {
      await tx.ticketEvent.create({
        data: {
          ticketId: quote.ticketId,
          type: eventType,
          payload: {
            quoteId: quote.id,
            quoteNumber: quote.invoiceNumber,
            fromStatus: quote.status,
            toStatus: input.nextStatus,
            internalComment: input.internalComment ?? null,
          },
        },
      });
    }

    await tx.integrationEvent.create({
      data: {
        type: eventType,
        aggregateType: "Invoice",
        aggregateId: quote.id,
        payload: {
          quoteId: quote.id,
          quoteNumber: quote.invoiceNumber,
          ticketId: quote.ticketId,
          customerId: quote.customerId,
          fromStatus: quote.status,
          toStatus: input.nextStatus,
          approvalPlaceholder: true,
        },
      },
    });

    if (input.nextStatus === InvoiceStatus.SENT) {
      await registerEmailNotificationPlaceholder(tx, {
        template: "quote.sent",
        recipient: {
          customerId: quote.customerId,
          ticketId: quote.ticketId ?? undefined,
          email: quote.customer.email ?? undefined,
        },
        data: {
          customerName: `${quote.customer.firstName} ${quote.customer.lastName ?? ""}`.trim(),
          ticketNumber: quote.ticket?.ticketNumber ?? "N/A",
          quoteNumber: quote.invoiceNumber,
          total: quote.total.toString(),
          currency: quote.currency,
        },
      });
    }

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: eventType,
      entityType: "Invoice",
      entityId: quote.id,
      before: {
        status: quote.status,
      },
      after: {
        status: updatedQuote.status,
        sentAt: updatedQuote.sentAt?.toISOString() ?? null,
        approvedAt: updatedQuote.approvedAt?.toISOString() ?? null,
        rejectedAt: updatedQuote.rejectedAt?.toISOString() ?? null,
      },
      metadata: {
        module: "quotes",
        quoteNumber: quote.invoiceNumber,
        internalComment: input.internalComment ?? null,
      },
    });

    return updatedQuote;
  });
}

async function recalculateQuoteTotals(tx: Prisma.TransactionClient, quoteId: string) {
  const items = await tx.invoiceItem.findMany({
    where: { invoiceId: quoteId },
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const taxTotal = 0;
  const total = subtotal + taxTotal;

  await tx.invoice.update({
    where: { id: quoteId },
    data: {
      subtotal,
      taxTotal,
      total,
    },
  });

  return {
    subtotal,
    taxTotal,
    total,
  };
}

function createQuoteNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = randomBytes(3).toString("hex").toUpperCase();

  return `Q-${datePart}-${suffix}`;
}

function createApprovalToken(seed: string) {
  return createHash("sha256")
    .update(`${seed}:${randomBytes(16).toString("hex")}`)
    .digest("hex");
}

function quoteEventForStatus(status: InvoiceStatus) {
  if (status === InvoiceStatus.SENT) {
    return "quote.sent";
  }

  if (status === InvoiceStatus.APPROVED) {
    return "quote.approved";
  }

  if (status === InvoiceStatus.REJECTED) {
    return "quote.rejected";
  }

  if (status === InvoiceStatus.EXPIRED) {
    return "quote.expired";
  }

  return "quote.updated";
}
