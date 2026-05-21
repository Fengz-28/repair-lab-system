import { InvoiceStatus, InvoiceType, Prisma, type TicketStatus } from "@prisma/client";

import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { prisma } from "@/server/db/prisma";

import { quoteStatusLabel, ticketStatusLabel } from "./tracking-labels";

const publicQuoteStatuses = [InvoiceStatus.SENT, InvoiceStatus.APPROVED] as const;

export async function getPublicTrackingData(token: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { publicAccessToken: token },
    include: {
      device: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
      },
      events: {
        orderBy: { createdAt: "asc" },
      },
      invoices: {
        where: {
          type: {
            in: [InvoiceType.QUOTE, InvoiceType.INVOICE],
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
          },
          payments: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  const quotes = ticket.invoices.filter(
    (invoice) =>
      invoice.type === InvoiceType.QUOTE &&
      publicQuoteStatuses.includes(invoice.status as (typeof publicQuoteStatuses)[number]),
  );
  const invoice = ticket.invoices.find((item) => item.type === InvoiceType.INVOICE) ?? null;
  const invoiceTotals = invoice ? calculatePaymentTotals(invoice.total, invoice.payments) : null;

  return {
    token,
    ticket: {
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      statusLabel: ticketStatusLabel(ticket.status),
      title: ticket.title,
      reportedIssue: ticket.reportedIssue,
      createdAt: ticket.createdAt,
    },
    device: {
      label: `${ticket.device.brand}${ticket.device.model ? ` ${ticket.device.model}` : ""}`,
      serial: ticket.device.serial,
    },
    timeline: buildPublicTimeline(ticket),
    quote: quotes[0]
      ? {
          id: quotes[0].id,
          invoiceNumber: quotes[0].invoiceNumber,
          status: quotes[0].status,
          statusLabel: quoteStatusLabel(quotes[0].status),
          currency: quotes[0].currency,
          subtotal: quotes[0].subtotal,
          taxTotal: quotes[0].taxTotal,
          total: quotes[0].total,
          customerNotes: quotes[0].customerNotes,
          createdAt: quotes[0].createdAt,
          items: quotes[0].items.map((item) => ({
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        }
      : null,
    invoice: invoice
      ? {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          paymentStatus: invoice.paymentStatus,
          currency: invoice.currency,
          subtotal: invoice.subtotal,
          taxTotal: invoice.taxTotal,
          total: invoice.total,
          paidTotal: invoiceTotals?.paidTotal ?? 0,
          balanceDue: invoiceTotals?.balanceDue ?? 0,
          createdAt: invoice.createdAt,
        }
      : null,
  };
}

export async function getPublicQuotePdfAccess(token: string) {
  const data = await getPublicTrackingData(token);

  if (!data?.quote) {
    return null;
  }

  return {
    quoteId: data.quote.id,
  };
}

export async function getPublicInvoicePdfAccess(token: string) {
  const data = await getPublicTrackingData(token);

  if (!data?.invoice) {
    return null;
  }

  return {
    invoiceId: data.invoice.id,
  };
}

type PublicTrackingTicket = Prisma.TicketGetPayload<{
  include: {
    device: true;
    statusHistory: true;
    events: true;
    invoices: {
      include: {
        items: true;
        payments: true;
      };
    };
  };
}>;

function buildPublicTimeline(ticket: PublicTrackingTicket) {
  const statusItems = ticket.statusHistory.map((entry) => ({
    id: `status-${entry.id}`,
    title: publicStatusTimelineTitle(entry.toStatus),
    createdAt: entry.createdAt,
  }));

  const eventItems = ticket.events
    .map((event) => ({
      id: `event-${event.id}`,
      title: publicEventTitle(event.type),
      createdAt: event.createdAt,
    }))
    .filter((event): event is { id: string; title: string; createdAt: Date } => Boolean(event.title));

  return [...statusItems, ...eventItems].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function publicStatusTimelineTitle(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Ticket recibido",
    INITIAL_REVIEW: "Revision iniciada",
    DIAGNOSIS: "Diagnostico iniciado",
    WAITING_APPROVAL: "Esperando aprobacion del cliente",
    APPROVED: "Reparacion aprobada",
    REPAIR_IN_PROGRESS: "Reparacion iniciada",
    READY_FOR_PICKUP: "Equipo listo para entrega",
    DELIVERED: "Ticket cerrado",
    CANCELLED: "Ticket cancelado",
  };

  return labels[status] ?? ticketStatusLabel(status);
}

function publicEventTitle(type: string) {
  const labels: Record<string, string> = {
    "ticket.created": "Ticket creado",
    "quote.sent": "Cotizacion enviada",
    "quote.approved": "Cotizacion aprobada",
    "quote.rejected": "Cotizacion rechazada",
    "quote.expired": "Cotizacion expirada",
    "invoice.created": "Factura generada",
    "invoice.payment_recorded": "Pago registrado",
    "invoice.paid": "Factura pagada",
  };

  return labels[type] ?? null;
}
