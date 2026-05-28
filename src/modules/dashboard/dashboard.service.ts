import {
  InventoryMovementType,
  InvoiceStatus,
  InvoiceType,
  PaymentMethod,
  PaymentStatus,
  TicketStatus,
} from "@prisma/client";

import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { prisma } from "@/server/db/prisma";

const attentionStatuses = [
  TicketStatus.DIAGNOSIS,
  TicketStatus.WAITING_APPROVAL,
  TicketStatus.APPROVED,
] as const;

export async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ticketGroups,
    quoteGroups,
    invoiceGroups,
    quoteTotals,
    approvedQuoteTotals,
    invoiceTotals,
    payments,
    todayPayments,
    monthPayments,
    paymentGroups,
    catalogItems,
    ticketsNeedingAttention,
    pendingQuotes,
    pendingInvoices,
    recentMovements,
    recentEvents,
  ] = await Promise.all([
    prisma.ticket.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      where: { type: InvoiceType.QUOTE },
      _count: { _all: true },
    }),
    prisma.invoice.groupBy({
      by: ["paymentStatus"],
      where: { type: InvoiceType.INVOICE },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { type: InvoiceType.QUOTE },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { type: InvoiceType.QUOTE, status: InvoiceStatus.APPROVED },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { type: InvoiceType.INVOICE },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["method"],
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.catalogItem.findMany({
      include: {
        inventoryItem: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.ticket.findMany({
      where: {
        status: { in: [...attentionStatuses] },
      },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: {
        customer: true,
        device: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        type: InvoiceType.QUOTE,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.DRAFT] },
      },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: {
        customer: true,
        ticket: true,
        items: { select: { id: true } },
      },
    }),
    prisma.invoice.findMany({
      where: {
        type: InvoiceType.INVOICE,
        paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID] },
      },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: {
        customer: true,
        ticket: true,
        payments: true,
      },
    }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        inventoryItem: {
          include: {
            catalogItem: true,
          },
        },
      },
    }),
    prisma.ticketEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
          },
        },
      },
    }),
  ]);

  const ticketCounts = mapGroupedCounts(ticketGroups, "status");
  const quoteCounts = mapGroupedCounts(quoteGroups, "status");
  const invoicePaymentCounts = mapGroupedCounts(invoiceGroups, "paymentStatus");
  const lowStockItems = catalogItems.filter(
    (item) =>
      item.trackInventory &&
      item.inventoryItem &&
      item.inventoryItem.quantityOnHand <= item.inventoryItem.reorderLevel,
  );
  const outOfStockItems = catalogItems.filter(
    (item) =>
      item.trackInventory &&
      (!item.inventoryItem || item.inventoryItem.quantityOnHand <= 0),
  );
  const inventoryValue = catalogItems.reduce((sum, item) => {
    if (!item.trackInventory || !item.inventoryItem || !item.costPrice) {
      return sum;
    }

    return sum + Number(item.costPrice) * item.inventoryItem.quantityOnHand;
  }, 0);
  const paidTotal = Number(payments._sum.amount ?? 0);
  const totalInvoiced = Number(invoiceTotals._sum.total ?? 0);

  return {
    tickets: {
      total: sumCountMap(ticketCounts),
      open: countOpenTickets(ticketCounts),
      delivered: ticketCounts[TicketStatus.DELIVERED] ?? 0,
      diagnosis: ticketCounts[TicketStatus.DIAGNOSIS] ?? 0,
      waitingApproval: ticketCounts[TicketStatus.WAITING_APPROVAL] ?? 0,
      approved: ticketCounts[TicketStatus.APPROVED] ?? 0,
      inRepair: ticketCounts[TicketStatus.REPAIR_IN_PROGRESS] ?? 0,
      readyForPickup: ticketCounts[TicketStatus.READY_FOR_PICKUP] ?? 0,
    },
    quotes: {
      total: quoteTotals._count._all,
      draft: quoteCounts[InvoiceStatus.DRAFT] ?? 0,
      sent: quoteCounts[InvoiceStatus.SENT] ?? 0,
      approved: quoteCounts[InvoiceStatus.APPROVED] ?? 0,
      rejected: quoteCounts[InvoiceStatus.REJECTED] ?? 0,
      expired: quoteCounts[InvoiceStatus.EXPIRED] ?? 0,
      quotedTotal: Number(quoteTotals._sum.total ?? 0),
      approvedTotal: Number(approvedQuoteTotals._sum.total ?? 0),
    },
    invoices: {
      total: invoiceTotals._count._all,
      paid: invoicePaymentCounts[PaymentStatus.PAID] ?? 0,
      unpaid: invoicePaymentCounts[PaymentStatus.UNPAID] ?? 0,
      partiallyPaid: invoicePaymentCounts[PaymentStatus.PARTIALLY_PAID] ?? 0,
      invoicedTotal: totalInvoiced,
      paidTotal,
      balanceDue: Math.max(totalInvoiced - paidTotal, 0),
    },
    payments: {
      count: payments._count._all,
      receivedTotal: paidTotal,
      receivedToday: Number(todayPayments._sum.amount ?? 0),
      receivedThisMonth: Number(monthPayments._sum.amount ?? 0),
      byMethod: paymentGroups.map((group) => ({
        method: group.method,
        count: group._count._all,
        total: Number(group._sum.amount ?? 0),
      })),
    },
    inventory: {
      catalogItems: catalogItems.length,
      trackedItems: catalogItems.filter((item) => item.trackInventory).length,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      estimatedValue: inventoryValue,
    },
    lists: {
      ticketsNeedingAttention: ticketsNeedingAttention.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        customerName: customerName(ticket.customer),
        deviceLabel: `${ticket.device.brand} ${ticket.device.model ?? ""}`.trim(),
        createdAt: ticket.createdAt,
      })),
      pendingQuotes: pendingQuotes.map((quote) => ({
        id: quote.id,
        invoiceNumber: quote.invoiceNumber,
        status: quote.status,
        ticketId: quote.ticketId,
        ticketNumber: quote.ticket?.ticketNumber ?? "Sin ticket",
        customerName: customerName(quote.customer),
        total: Number(quote.total),
        itemCount: quote.items.length,
        createdAt: quote.createdAt,
      })),
      pendingInvoices: pendingInvoices.map((invoice) => {
        const totals = calculatePaymentTotals(invoice.total, invoice.payments);

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          ticketId: invoice.ticketId,
          ticketNumber: invoice.ticket?.ticketNumber ?? "Sin ticket",
          customerName: customerName(invoice.customer),
          paymentStatus: invoice.paymentStatus,
          total: totals.invoiceTotal,
          paid: totals.paidTotal,
          balanceDue: totals.balanceDue,
          createdAt: invoice.createdAt,
        };
      }),
      inventoryAlerts: [...lowStockItems, ...outOfStockItems]
        .filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index)
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          quantityOnHand: item.inventoryItem?.quantityOnHand ?? 0,
          reorderLevel: item.inventoryItem?.reorderLevel ?? 0,
        })),
      recentMovements: recentMovements.map((movement) => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        itemName: movement.inventoryItem.catalogItem.name,
        referenceType: movement.referenceType,
        referenceId: movement.referenceId,
        createdAt: movement.createdAt,
      })),
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        ticketId: event.ticketId,
        ticketNumber: event.ticket.ticketNumber,
        title: ticketEventTitle(event.type, event.payload),
        createdAt: event.createdAt,
      })),
    },
  };
}

function mapGroupedCounts<T extends string>(
  groups: (Record<string, unknown> & { _count: { _all: number } })[],
  key: string,
) {
  return groups.reduce<Record<T, number>>((acc, group) => {
    const value = group[key] as T;
    acc[value] = group._count._all;
    return acc;
  }, {} as Record<T, number>);
}

function sumCountMap(counts: Partial<Record<string, number>>) {
  return Object.values(counts).reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function countOpenTickets(counts: Partial<Record<TicketStatus, number>>) {
  return Object.entries(counts).reduce<number>((sum, [status, value]) => {
    return status === TicketStatus.DELIVERED || status === TicketStatus.CANCELLED
      ? sum
      : sum + (value ?? 0);
  }, 0);
}

function customerName(customer: { firstName: string; lastName: string | null }) {
  return `${customer.firstName} ${customer.lastName ?? ""}`.trim();
}

function ticketEventTitle(type: string, payload: unknown) {
  const payloadObject = isRecord(payload) ? payload : {};

  if (typeof payloadObject.timelineLabel === "string") {
    return payloadObject.timelineLabel;
  }

  const labels: Record<string, string> = {
    "ticket.created": "Ticket creado",
    "ticket.status_changed": "Estado de ticket actualizado",
    "ticket.comment_added": "Comentario agregado",
    "ticket.technical_note_added": "Notas tecnicas actualizadas",
    "quote.created": "Cotizacion creada",
    "quote.sent": "Cotizacion enviada",
    "quote.approved": "Cotizacion aprobada",
    "quote.rejected": "Cotizacion rechazada",
    "quote.expired": "Cotizacion expirada",
    "invoice.created": "Factura generada",
    "invoice.payment_recorded": "Pago registrado",
    "invoice.paid": "Factura pagada",
  };

  return labels[type] ?? type;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revision inicial",
    DIAGNOSIS: "En diagnóstico",
    WAITING_APPROVAL: "Esperando aprobación",
    APPROVED: "Listo para reparación",
    REPAIR_IN_PROGRESS: "En reparación",
    READY_FOR_PICKUP: "Listo para entrega",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}

export function quoteStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
    PAID: "Pagada",
    PARTIALLY_PAID: "Parcialmente pagada",
    UNPAID: "Pendiente",
  };

  return labels[status] ?? status;
}

export function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    UNPAID: "Pendiente",
    PARTIALLY_PAID: "Parcialmente pagada",
    PAID: "Pagada",
    REFUNDED: "Reembolsada",
    VOID: "Anulada",
  };

  return labels[status] ?? status;
}

export function paymentMethodLabel(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    SINPE: "SINPE",
    OTHER: "Otro",
  };

  return labels[method] ?? method;
}

export function inventoryMovementLabel(type: InventoryMovementType) {
  const labels: Record<InventoryMovementType, string> = {
    IN: "Entrada",
    OUT: "Salida",
    ADJUSTMENT: "Ajuste",
    RESERVED: "Reservado",
    RELEASED: "Liberado",
  };

  return labels[type] ?? type;
}
