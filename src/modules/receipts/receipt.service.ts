import { InvoiceStatus, InvoiceType, PaymentStatus, Prisma } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";

import { renderReceptionReceiptPreview } from "./receipt.template";
import type { ReceptionReceipt } from "./receipt.schema";

type ReceiptDb = Prisma.TransactionClient;

type CreateReceptionReceiptInput = {
  customerId: string;
  ticketId: string;
  actorUserId?: string | null;
  receipt: ReceptionReceipt;
};

export async function createReceptionReceiptPlaceholder(
  db: ReceiptDb,
  input: CreateReceptionReceiptInput,
) {
  const preview = renderReceptionReceiptPreview(input.receipt);

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber: input.receipt.receiptNumber,
      type: InvoiceType.RECEIPT,
      status: InvoiceStatus.DRAFT,
      paymentStatus: PaymentStatus.UNPAID,
      customerId: input.customerId,
      ticketId: input.ticketId,
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      currency: "CRC",
      notes: preview.text,
      items: {
        create: {
          itemType: "SERVICE",
          description: "Comprobante placeholder de recepcion de equipo",
          quantity: 1,
          unitPrice: 0,
          lineTotal: 0,
        },
      },
    },
  });

  await db.integrationEvent.create({
    data: {
      type: "receipt.created",
      aggregateType: "Invoice",
      aggregateId: invoice.id,
      payload: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        ticketId: input.ticketId,
        placeholder: true,
      },
    },
  });

  await writeAuditLog(db, {
    actorUserId: input.actorUserId ?? null,
    action: "receipt.placeholder_created",
    entityType: "Invoice",
    entityId: invoice.id,
    after: {
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
      total: "0",
    },
    metadata: {
      ticketId: input.ticketId,
      placeholder: true,
    },
  });

  return {
    invoice,
    preview,
  };
}
