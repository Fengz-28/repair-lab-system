import { InvoiceType, type Prisma } from "@prisma/client";

import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { prisma } from "@/server/db/prisma";

import { customerName } from "./customer-labels";

export type CustomerListSearchParams = {
  search?: string;
};

export async function getCustomerListData(params: CustomerListSearchParams) {
  const search = normalizeParam(params.search);

  const customers = await prisma.customer.findMany({
    where: buildCustomerWhere(search),
    orderBy: { createdAt: "desc" },
    include: {
      devices: true,
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          device: true,
        },
      },
      invoices: {
        where: { type: InvoiceType.INVOICE },
        include: {
          payments: true,
        },
      },
      _count: {
        select: {
          tickets: true,
          devices: true,
        },
      },
    },
  });

  return {
    search: search ?? "",
    customers: customers.map((customer) => {
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
      const latestTicket = customer.tickets[0] ?? null;

      return {
        id: customer.id,
        name: customerName(customer),
        contact: customer.whatsappPhone ?? customer.phone ?? customer.email ?? "Sin contacto",
        email: customer.email,
        ticketCount: customer._count.tickets,
        deviceCount: customer._count.devices,
        totalInvoiced: financials.invoiced,
        totalPaid: financials.paid,
        balanceDue: financials.balance,
        latestTicket: latestTicket
          ? {
              id: latestTicket.id,
              ticketNumber: latestTicket.ticketNumber,
              status: latestTicket.status,
              deviceLabel: `${latestTicket.device.brand} ${latestTicket.device.model ?? ""}`.trim(),
              createdAt: latestTicket.createdAt,
            }
          : null,
      };
    }),
  };
}

function buildCustomerWhere(search: string | undefined) {
  if (!search) {
    return undefined;
  }

  return {
    OR: [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { whatsappPhone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { devices: { some: { brand: { contains: search, mode: "insensitive" } } } },
      { devices: { some: { model: { contains: search, mode: "insensitive" } } } },
      { devices: { some: { serial: { contains: search, mode: "insensitive" } } } },
      { tickets: { some: { ticketNumber: { contains: search, mode: "insensitive" } } } },
    ],
  } satisfies Prisma.CustomerWhereInput;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || undefined;
  }

  return value?.trim() || undefined;
}
