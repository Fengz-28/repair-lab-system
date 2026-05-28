import { InvoiceType } from "@prisma/client";

import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { prisma } from "@/server/db/prisma";

import { formatMoney, invoiceStatusLabel, itemTypeLabel, paymentMethodLabel, paymentStatusLabel } from "./pdf-labels";
import {
  createPdfContext,
  drawHeader,
  drawKeyValues,
  drawParagraph,
  drawSectionTitle,
  drawTable,
  drawTotals,
  savePdf,
} from "./pdf-renderer";

export async function generateInvoicePdf(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      ticket: {
        include: {
          device: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!invoice || invoice.type !== InvoiceType.INVOICE || !invoice.ticket) {
    throw new Error("Factura no encontrada.");
  }

  const totals = calculatePaymentTotals(invoice.total, invoice.payments);
  const ctx = await createPdfContext();

  drawHeader(ctx, "Factura interna", invoice.invoiceNumber);
  drawKeyValues(ctx, [
    ["Fecha", invoice.createdAt.toLocaleDateString("es-CR")],
    ["Estado", invoiceStatusLabel(invoice.status)],
    ["Estado de pago", paymentStatusLabel(invoice.paymentStatus)],
    ["Ticket", invoice.ticket.ticketNumber],
  ]);

  drawSectionTitle(ctx, "Cliente");
  drawKeyValues(ctx, [
    ["Nombre", `${invoice.customer.firstName} ${invoice.customer.lastName ?? ""}`.trim()],
    ["Contacto", invoice.customer.whatsappPhone ?? invoice.customer.phone ?? invoice.customer.email ?? "Sin contacto"],
    ["Email", invoice.customer.email ?? "No registrado"],
    ["Teléfono", invoice.customer.phone ?? invoice.customer.whatsappPhone ?? "No registrado"],
  ]);

  drawSectionTitle(ctx, "Ticket y equipo");
  drawKeyValues(ctx, [
    ["Ticket", `${invoice.ticket.ticketNumber} - ${invoice.ticket.title}`],
    ["Equipo", `${invoice.ticket.device.brand} ${invoice.ticket.device.model ?? ""}`.trim()],
    ["Serial", invoice.ticket.device.serial ?? "No registrado"],
  ], 1);

  drawSectionTitle(ctx, "Lineas");
  drawTable(ctx, [
    { label: "Tipo", width: 70, value: (item) => itemTypeLabel(item.itemType) },
    { label: "Descripcion", width: 230, value: (item) => item.description },
    { label: "Cant.", width: 50, align: "right", value: (item) => String(item.quantity) },
    { label: "Unitario", width: 85, align: "right", value: (item) => formatMoney(invoice.currency, item.unitPrice) },
    { label: "Total", width: 65, align: "right", value: (item) => formatMoney(invoice.currency, item.lineTotal) },
  ], invoice.items);

  drawTotals(ctx, [
    ["Subtotal", formatMoney(invoice.currency, invoice.subtotal)],
    ["Impuestos", formatMoney(invoice.currency, invoice.taxTotal)],
    ["Total", formatMoney(invoice.currency, invoice.total)],
    ["Pagado", formatMoney(invoice.currency, totals.paidTotal)],
    ["Saldo", formatMoney(invoice.currency, totals.balanceDue)],
  ]);

  drawSectionTitle(ctx, "Pagos registrados");
  drawTable(ctx, [
    { label: "Fecha", width: 150, value: (payment) => payment.createdAt.toLocaleDateString("es-CR") },
    { label: "Monto", width: 120, align: "right", value: (payment) => formatMoney(invoice.currency, payment.amount) },
    { label: "Metodo", width: 100, value: (payment) => paymentMethodLabel(payment.method) },
    { label: "Referencia", width: 130, value: (payment) => payment.reference ?? "-" },
  ], invoice.payments);

  drawSectionTitle(ctx, "Nota");
  drawParagraph(ctx, "Documento administrativo interno. No corresponde a factura fiscal electrónica.");

  return {
    filename: `${invoice.invoiceNumber}.pdf`,
    bytes: await savePdf(ctx),
  };
}
