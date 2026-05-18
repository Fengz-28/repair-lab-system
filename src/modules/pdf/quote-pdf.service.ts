import { InvoiceType } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import { formatMoney, invoiceStatusLabel, itemTypeLabel } from "./pdf-labels";
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

export async function generateQuotePdf(quoteId: string) {
  const quote = await prisma.invoice.findUnique({
    where: { id: quoteId },
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
    },
  });

  if (!quote || quote.type !== InvoiceType.QUOTE || !quote.ticket) {
    throw new Error("Cotizacion no encontrada.");
  }

  const ctx = await createPdfContext();

  drawHeader(ctx, "Cotizacion", quote.invoiceNumber);
  drawKeyValues(ctx, [
    ["Fecha", quote.createdAt.toLocaleDateString("es-CR")],
    ["Estado", invoiceStatusLabel(quote.status)],
    ["Ticket", quote.ticket.ticketNumber],
    ["Referencia interna", quote.id],
  ]);

  drawSectionTitle(ctx, "Cliente");
  drawKeyValues(ctx, [
    ["Nombre", `${quote.customer.firstName} ${quote.customer.lastName ?? ""}`.trim()],
    ["Contacto", quote.customer.whatsappPhone ?? quote.customer.phone ?? quote.customer.email ?? "Sin contacto"],
    ["Email", quote.customer.email ?? "No registrado"],
    ["Telefono", quote.customer.phone ?? quote.customer.whatsappPhone ?? "No registrado"],
  ]);

  drawSectionTitle(ctx, "Equipo");
  drawKeyValues(ctx, [
    ["Equipo", `${quote.ticket.device.brand} ${quote.ticket.device.model ?? ""}`.trim()],
    ["Serial", quote.ticket.device.serial ?? "No registrado"],
    ["Problema reportado", quote.ticket.reportedIssue],
  ], 1);

  drawSectionTitle(ctx, "Lineas");
  drawTable(ctx, [
    { label: "Tipo", width: 70, value: (item) => itemTypeLabel(item.itemType) },
    { label: "Descripcion", width: 230, value: (item) => item.description },
    { label: "Cant.", width: 50, align: "right", value: (item) => String(item.quantity) },
    { label: "Unitario", width: 85, align: "right", value: (item) => formatMoney(quote.currency, item.unitPrice) },
    { label: "Total", width: 65, align: "right", value: (item) => formatMoney(quote.currency, item.lineTotal) },
  ], quote.items);

  drawTotals(ctx, [
    ["Subtotal", formatMoney(quote.currency, quote.subtotal)],
    ["Impuestos", formatMoney(quote.currency, quote.taxTotal)],
    ["Total", formatMoney(quote.currency, quote.total)],
  ]);

  drawSectionTitle(ctx, "Notas");
  drawParagraph(
    ctx,
    quote.customerNotes ??
      "Precios sujetos a disponibilidad de repuestos y validacion tecnica final.",
  );
  drawParagraph(ctx, "Esta cotizacion no representa factura fiscal ni comprobante tributario.");

  return {
    filename: `${quote.invoiceNumber}.pdf`,
    bytes: await savePdf(ctx),
  };
}
