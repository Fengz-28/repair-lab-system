import type { InvoiceStatus, PaymentMethod, PaymentStatus, ProductType } from "@prisma/client";

export function invoiceStatusLabel(status: InvoiceStatus) {
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
