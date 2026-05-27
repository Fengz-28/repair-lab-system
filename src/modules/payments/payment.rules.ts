import { InvoiceStatus, PaymentStatus, Prisma } from "@prisma/client";

export function calculatePaymentTotals(
  invoiceTotalValue: Prisma.Decimal | number | string,
  payments: { amount: Prisma.Decimal | number | string }[],
) {
  const invoiceTotal = Number(invoiceTotalValue);
  const paidTotal = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balanceDue = Math.max(invoiceTotal - paidTotal, 0);

  return {
    invoiceTotal,
    paidTotal,
    balanceDue,
  };
}

export function paymentStatusForBalance(paidTotal: number, invoiceTotal: number) {
  if (paidTotal <= 0) {
    return PaymentStatus.UNPAID;
  }

  if (paidTotal >= invoiceTotal) {
    return PaymentStatus.PAID;
  }

  return PaymentStatus.PARTIALLY_PAID;
}

export function invoiceStatusForPaymentStatus(status: PaymentStatus) {
  if (status === PaymentStatus.PAID) {
    return InvoiceStatus.PAID;
  }

  if (status === PaymentStatus.PARTIALLY_PAID) {
    return InvoiceStatus.PARTIALLY_PAID;
  }

  return InvoiceStatus.UNPAID;
}

export function assertManualPaymentAllowed(input: {
  invoiceTotal: number;
  balanceDue: number;
  amount: number;
}) {
  if (input.amount <= 0) {
    throw new Error("El pago debe ser mayor a cero.");
  }

  if (input.invoiceTotal <= 0) {
    throw new Error("No se puede registrar pago sobre una factura con total cero.");
  }

  if (input.balanceDue <= 0) {
    throw new Error("Esta factura ya esta pagada.");
  }

  if (input.amount > input.balanceDue) {
    throw new Error("El pago no puede ser mayor al saldo pendiente.");
  }
}
