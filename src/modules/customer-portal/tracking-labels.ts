import type { InvoiceStatus, PaymentStatus, ProductType, TicketStatus } from "@prisma/client";

export function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "En revisión",
    DIAGNOSIS: "En diagnóstico",
    WAITING_APPROVAL: "Esperando aprobación",
    APPROVED: "Aprobado",
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

export function itemTypeLabel(type: ProductType) {
  const labels: Record<ProductType, string> = {
    SERVICE: "Servicio",
    PRODUCT: "Producto",
    PART: "Repuesto",
  };

  return labels[type] ?? type;
}

export function formatMoney(currency: string, value: { toString(): string } | number | string) {
  const numericValue = Number(value);

  return `${currency} ${numericValue.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
