import type { PaymentStatus, TicketStatus } from "@prisma/client";

export function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revisión inicial",
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

export function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    UNPAID: "Pendiente",
    PARTIALLY_PAID: "Parcial",
    PAID: "Pagada",
    REFUNDED: "Reembolsada",
    VOID: "Anulada",
  };

  return labels[status] ?? status;
}

export function formatMoney(value: number) {
  return `CRC ${value.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function customerName(customer: { firstName: string; lastName: string | null }) {
  return `${customer.firstName} ${customer.lastName ?? ""}`.trim();
}
