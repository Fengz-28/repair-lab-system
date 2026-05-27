import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  assertManualPaymentAllowed,
  calculatePaymentTotals,
  invoiceStatusForPaymentStatus,
  paymentStatusForBalance,
} from "./payment.rules";

describe("payment rules", () => {
  it("calculates paid total and remaining balance", () => {
    expect(calculatePaymentTotals(100, [{ amount: 25 }, { amount: "30" }])).toEqual({
      invoiceTotal: 100,
      paidTotal: 55,
      balanceDue: 45,
    });
  });

  it("maps partial and complete payments to payment statuses", () => {
    expect(paymentStatusForBalance(0, 100)).toBe(PaymentStatus.UNPAID);
    expect(paymentStatusForBalance(40, 100)).toBe(PaymentStatus.PARTIALLY_PAID);
    expect(paymentStatusForBalance(100, 100)).toBe(PaymentStatus.PAID);
  });

  it("maps payment status to invoice status", () => {
    expect(invoiceStatusForPaymentStatus(PaymentStatus.PARTIALLY_PAID)).toBe(
      InvoiceStatus.PARTIALLY_PAID,
    );
    expect(invoiceStatusForPaymentStatus(PaymentStatus.PAID)).toBe(InvoiceStatus.PAID);
    expect(invoiceStatusForPaymentStatus(PaymentStatus.UNPAID)).toBe(InvoiceStatus.UNPAID);
  });

  it("rejects invalid manual payment amounts", () => {
    expect(() =>
      assertManualPaymentAllowed({ invoiceTotal: 100, balanceDue: 100, amount: 0 }),
    ).toThrow("El pago debe ser mayor a cero.");

    expect(() =>
      assertManualPaymentAllowed({ invoiceTotal: 100, balanceDue: 50, amount: 51 }),
    ).toThrow("El pago no puede ser mayor al saldo pendiente.");
  });
});
