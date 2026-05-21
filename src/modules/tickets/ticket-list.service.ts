import { InvoiceType, PaymentStatus, TicketStatus, type Prisma } from "@prisma/client";

import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { prisma } from "@/server/db/prisma";

export type TicketListSearchParams = {
  search?: string;
  status?: string;
  sort?: string;
  view?: string;
};

const openStatuses = [
  TicketStatus.RECEIVED,
  TicketStatus.INITIAL_REVIEW,
  TicketStatus.DIAGNOSIS,
  TicketStatus.WAITING_APPROVAL,
  TicketStatus.APPROVED,
  TicketStatus.REPAIR_IN_PROGRESS,
  TicketStatus.READY_FOR_PICKUP,
];

export async function getTicketListData(params: TicketListSearchParams) {
  const search = normalizeParam(params.search);
  const statusFilter = normalizeParam(params.status) ?? "all";
  const sort = normalizeParam(params.sort) ?? "recent";
  const view = normalizeParam(params.view) === "table" ? "table" : "cards";

  const tickets = await prisma.ticket.findMany({
    where: buildTicketWhere(search, statusFilter),
    orderBy: sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" },
    include: {
      customer: true,
      device: true,
      invoices: {
        where: {
          type: { in: [InvoiceType.QUOTE, InvoiceType.INVOICE] },
        },
        orderBy: { createdAt: "desc" },
        include: {
          payments: true,
          items: {
            select: { id: true },
          },
        },
      },
    },
  });

  const enrichedTickets = tickets.map((ticket) => {
    const quotes = ticket.invoices.filter((invoice) => invoice.type === InvoiceType.QUOTE);
    const invoices = ticket.invoices.filter((invoice) => invoice.type === InvoiceType.INVOICE);
    const invoice = invoices[0] ?? null;
    const financials = invoice ? calculatePaymentTotals(invoice.total, invoice.payments) : null;

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      status: ticket.status,
      reportedIssue: ticket.reportedIssue,
      createdAt: ticket.createdAt,
      customerName: `${ticket.customer.firstName} ${ticket.customer.lastName ?? ""}`.trim(),
      contact: ticket.customer.whatsappPhone ?? ticket.customer.phone ?? ticket.customer.email ?? "Sin contacto",
      deviceLabel: `${ticket.device.brand} ${ticket.device.model ?? ""}`.trim(),
      quotes,
      latestQuote: quotes[0] ?? null,
      invoice,
      financials,
      hasPendingQuote: quotes.some((quote) => quote.status === "SENT" || quote.status === "DRAFT"),
    };
  });

  const filteredByFinancialStatus = enrichedTickets.filter((ticket) => {
    if (statusFilter === "invoice_pending") {
      return ticket.invoice?.paymentStatus === PaymentStatus.UNPAID ||
        ticket.invoice?.paymentStatus === PaymentStatus.PARTIALLY_PAID;
    }

    if (statusFilter === "invoice_paid") {
      return ticket.invoice?.paymentStatus === PaymentStatus.PAID;
    }

    return true;
  });

  const sortedTickets = [...filteredByFinancialStatus].sort((a, b) => {
    if (sort === "invoiced_desc") {
      return Number(b.financials?.invoiceTotal ?? 0) - Number(a.financials?.invoiceTotal ?? 0);
    }

    if (sort === "balance_desc") {
      return Number(b.financials?.balanceDue ?? 0) - Number(a.financials?.balanceDue ?? 0);
    }

    return 0;
  });

  const lowStockCount = await prisma.catalogItem.count({
    where: {
      trackInventory: true,
      inventoryItem: {
        is: {
          quantityOnHand: {
            lte: prisma.inventoryItem.fields.reorderLevel,
          },
        },
      },
    },
  });

  return {
    tickets: sortedTickets,
    filters: {
      search: search ?? "",
      status: statusFilter,
      sort,
      view,
    },
    lowStockCount,
  };
}

function buildTicketWhere(search: string | undefined, statusFilter: string) {
  const where: Prisma.TicketWhereInput = {};

  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: "insensitive" } },
      { reportedIssue: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { customer: { firstName: { contains: search, mode: "insensitive" } } },
      { customer: { lastName: { contains: search, mode: "insensitive" } } },
      { customer: { phone: { contains: search, mode: "insensitive" } } },
      { customer: { whatsappPhone: { contains: search, mode: "insensitive" } } },
      { customer: { email: { contains: search, mode: "insensitive" } } },
      { device: { brand: { contains: search, mode: "insensitive" } } },
      { device: { model: { contains: search, mode: "insensitive" } } },
      { device: { serial: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (statusFilter === "open") {
    where.status = { in: openStatuses };
  } else if (statusFilter === "closed") {
    where.status = { in: [TicketStatus.DELIVERED, TicketStatus.CANCELLED] };
  } else if (statusFilter === "waiting_approval") {
    where.status = TicketStatus.WAITING_APPROVAL;
  } else if (statusFilter === "diagnosis") {
    where.status = TicketStatus.DIAGNOSIS;
  } else if (statusFilter === "ready_for_repair") {
    where.status = TicketStatus.APPROVED;
  } else if (isTicketStatus(statusFilter)) {
    where.status = statusFilter;
  }

  return where;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }

  return value?.trim() || undefined;
}

function isTicketStatus(value: string): value is TicketStatus {
  return Object.values(TicketStatus).includes(value as TicketStatus);
}
