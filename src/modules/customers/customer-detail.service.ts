import { InvoiceType } from "@prisma/client";

import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { prisma } from "@/server/db/prisma";

import { customerName } from "./customer-labels";

export async function getCustomerDetailData(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      devices: {
        include: {
          tickets: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      tickets: {
        orderBy: { createdAt: "desc" },
        include: {
          device: true,
          events: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          invoices: {
            where: { type: { in: [InvoiceType.QUOTE, InvoiceType.INVOICE] } },
            orderBy: { createdAt: "desc" },
            include: {
              payments: true,
            },
          },
        },
      },
      invoices: {
        where: { type: InvoiceType.INVOICE },
        include: {
          payments: true,
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const financials = customer.invoices.reduce(
    (totals, invoice) => {
      const invoiceTotals = calculatePaymentTotals(invoice.total, invoice.payments);
      totals.invoiced += invoiceTotals.invoiceTotal;
      totals.paid += invoiceTotals.paidTotal;
      totals.balance += invoiceTotals.balanceDue;
      return totals;
    },
    { invoiced: 0, paid: 0, balance: 0 },
  );
  const firstTicket = [...customer.tickets].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )[0];

  return {
    customer: {
      id: customer.id,
      name: customerName(customer),
      contact: customer.whatsappPhone ?? customer.phone ?? customer.email ?? "Sin contacto",
      phone: customer.phone,
      whatsappPhone: customer.whatsappPhone,
      email: customer.email,
      firstTicketAt: firstTicket?.createdAt ?? null,
      ticketCount: customer.tickets.length,
      invoiceCount: customer.invoices.length,
      totalInvoiced: financials.invoiced,
      totalPaid: financials.paid,
      balanceDue: financials.balance,
    },
    devices: customer.devices.map((device) => ({
      id: device.id,
      label: `${device.brand} ${device.model ?? ""}`.trim(),
      serial: device.serial,
      type: device.type,
      ticketCount: device.tickets.length,
    })),
    tickets: customer.tickets.map((ticket) => {
      const quotes = ticket.invoices.filter((invoice) => invoice.type === InvoiceType.QUOTE);
      const invoices = ticket.invoices.filter((invoice) => invoice.type === InvoiceType.INVOICE);
      const invoice = invoices[0] ?? null;
      const totals = invoice ? calculatePaymentTotals(invoice.total, invoice.payments) : null;

      return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        problem: ticket.reportedIssue,
        deviceLabel: `${ticket.device.brand} ${ticket.device.model ?? ""}`.trim(),
        createdAt: ticket.createdAt,
        quotes,
        invoice,
        totals,
      };
    }),
    activity: customer.tickets
      .flatMap((ticket) =>
        ticket.events.map((event) => ({
          id: event.id,
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          title: eventTitle(event.type, event.payload),
          createdAt: event.createdAt,
        })),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 12),
  };
}

function eventTitle(type: string, payload: unknown) {
  const payloadObject = isRecord(payload) ? payload : {};

  if (typeof payloadObject.timelineLabel === "string") {
    return payloadObject.timelineLabel;
  }

  const labels: Record<string, string> = {
    "ticket.created": "Ticket creado",
    "ticket.status_changed": "Estado de ticket actualizado",
    "quote.created": "Cotizacion creada",
    "quote.approved": "Cotizacion aprobada",
    "invoice.created": "Factura generada",
    "invoice.payment_recorded": "Pago registrado",
    "invoice.paid": "Factura pagada",
  };

  return labels[type] ?? type;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
