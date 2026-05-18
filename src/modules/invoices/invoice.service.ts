import { randomBytes } from "crypto";
import { InvoiceStatus, InvoiceType, PaymentStatus } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";

import type { ConvertQuoteToInvoiceInput } from "./invoice.schema";

type InvoiceOptions = {
  actorUserId?: string | null;
};

export async function convertQuoteToInvoice(
  input: ConvertQuoteToInvoiceInput,
  options: InvoiceOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.invoice.findUnique({
      where: { id: input.quoteId },
      include: {
        items: true,
        ticket: true,
      },
    });

    if (!quote || quote.type !== InvoiceType.QUOTE) {
      throw new Error("Cotizacion no encontrada.");
    }

    if (quote.status !== InvoiceStatus.APPROVED) {
      throw new Error("Solo una cotizacion aprobada puede generar factura.");
    }

    if (quote.items.length === 0) {
      throw new Error("No se puede generar factura desde una cotizacion sin lineas.");
    }

    if (Number(quote.total) <= 0) {
      throw new Error("No se puede generar factura con total cero.");
    }

    const sourceMarker = sourceQuoteMarker(quote.id);
    const existingInvoice = await tx.invoice.findFirst({
      where: {
        type: InvoiceType.INVOICE,
        customerId: quote.customerId,
        ticketId: quote.ticketId,
        internalNotes: {
          contains: sourceMarker,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
      },
    });

    if (existingInvoice) {
      throw new Error(`Ya existe una factura generada desde esta cotizacion: ${existingInvoice.invoiceNumber}.`);
    }

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber: createInvoiceNumber(),
        type: InvoiceType.INVOICE,
        status: InvoiceStatus.UNPAID,
        paymentStatus: PaymentStatus.UNPAID,
        customerId: quote.customerId,
        ticketId: quote.ticketId,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        total: quote.total,
        currency: quote.currency,
        notes: quote.customerNotes,
        customerNotes: quote.customerNotes,
        internalNotes: buildInvoiceInternalNotes(quote.internalNotes, sourceMarker, quote.invoiceNumber),
        items: {
          create: quote.items.map((item) => ({
            catalogItemId: item.catalogItemId,
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    if (quote.ticketId) {
      await tx.ticketEvent.create({
        data: {
          ticketId: quote.ticketId,
          type: "invoice.created",
          payload: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            quoteId: quote.id,
            quoteNumber: quote.invoiceNumber,
            total: invoice.total.toString(),
            currency: invoice.currency,
            timelineLabel: "Factura generada desde cotizacion aprobada.",
          },
        },
      });
    }

    await tx.integrationEvent.create({
      data: {
        type: "invoice.created",
        aggregateType: "Invoice",
        aggregateId: invoice.id,
        payload: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          quoteId: quote.id,
          quoteNumber: quote.invoiceNumber,
          ticketId: quote.ticketId,
          customerId: quote.customerId,
          total: invoice.total.toString(),
          currency: invoice.currency,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "invoice.created",
      entityType: "Invoice",
      entityId: invoice.id,
      after: {
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        quoteId: quote.id,
        quoteNumber: quote.invoiceNumber,
        ticketId: quote.ticketId,
        customerId: quote.customerId,
        subtotal: invoice.subtotal.toString(),
        total: invoice.total.toString(),
        itemCount: invoice.items.length,
      },
      metadata: {
        module: "invoices",
        source: "quote",
      },
    });

    return invoice;
  });
}

export function sourceQuoteMarker(quoteId: string) {
  return `sourceQuoteId:${quoteId}`;
}

function buildInvoiceInternalNotes(
  quoteInternalNotes: string | null,
  sourceMarker: string,
  quoteNumber: string,
) {
  const generatedNote = `Factura generada desde cotizacion ${quoteNumber}. ${sourceMarker}`;

  return quoteInternalNotes ? `${generatedNote}\n\nNotas de cotizacion:\n${quoteInternalNotes}` : generatedNote;
}

function createInvoiceNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = randomBytes(3).toString("hex").toUpperCase();

  return `I-${datePart}-${suffix}`;
}
