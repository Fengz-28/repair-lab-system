import {
  InventoryMovementType,
  InvoiceStatus,
  InvoiceType,
  PaymentStatus,
  Prisma,
  ProductType,
} from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";

import type { RegisterManualPaymentInput } from "./payment.schema";

type PaymentOptions = {
  actorUserId?: string | null;
};

export async function registerManualPayment(
  input: RegisterManualPaymentInput,
  options: PaymentOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
      include: {
        payments: true,
        items: {
          include: {
            catalogItem: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    if (!invoice || invoice.type !== InvoiceType.INVOICE) {
      throw new Error("Factura no encontrada.");
    }

    if (Number(invoice.total) <= 0) {
      throw new Error("No se puede registrar pago sobre una factura con total cero.");
    }

    const totalsBefore = calculatePaymentTotals(invoice.total, invoice.payments);

    if (totalsBefore.balanceDue <= 0) {
      throw new Error("Esta factura ya esta pagada.");
    }

    if (input.amount > totalsBefore.balanceDue) {
      throw new Error("El pago no puede ser mayor al saldo pendiente.");
    }

    const projectedTotals = calculatePaymentTotals(invoice.total, [
      ...invoice.payments,
      { amount: input.amount },
    ]);
    const projectedPaymentStatus = paymentStatusForBalance(
      projectedTotals.paidTotal,
      projectedTotals.invoiceTotal,
    );

    if (projectedPaymentStatus === PaymentStatus.PAID) {
      await assertInvoiceInventoryCanBeDiscounted(tx, invoice);
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
        notes: input.notes,
      },
    });

    const totalsAfter = calculatePaymentTotals(invoice.total, [...invoice.payments, payment]);
    const nextPaymentStatus = paymentStatusForBalance(totalsAfter.paidTotal, totalsAfter.invoiceTotal);

    const inventoryMovements =
      nextPaymentStatus === PaymentStatus.PAID
        ? await discountInvoiceInventory(tx, invoice, options.actorUserId ?? null)
        : [];

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentStatus: nextPaymentStatus,
        status: invoiceStatusForPaymentStatus(nextPaymentStatus),
      },
    });

    const eventType = nextPaymentStatus === PaymentStatus.PAID ? "invoice.paid" : "invoice.payment_recorded";
    const timelineLabel =
      nextPaymentStatus === PaymentStatus.PAID
        ? "Factura marcada como pagada."
        : "Pago parcial registrado.";

    if (invoice.ticketId) {
      await tx.ticketEvent.create({
        data: {
          ticketId: invoice.ticketId,
          type: eventType,
          payload: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            paymentId: payment.id,
            amount: payment.amount.toString(),
            method: payment.method,
            paidTotal: totalsAfter.paidTotal.toFixed(2),
            balanceDue: totalsAfter.balanceDue.toFixed(2),
            currency: invoice.currency,
            inventoryMovementCount: inventoryMovements.length,
            timelineLabel,
          },
        },
      });
    }

    await tx.integrationEvent.create({
      data: {
        type: eventType,
        aggregateType: "Payment",
        aggregateId: payment.id,
        payload: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          ticketId: invoice.ticketId,
          customerId: invoice.customerId,
          amount: payment.amount.toString(),
          method: payment.method,
          paidTotal: totalsAfter.paidTotal.toFixed(2),
          balanceDue: totalsAfter.balanceDue.toFixed(2),
          paymentStatus: updatedInvoice.paymentStatus,
          inventoryMovementCount: inventoryMovements.length,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: eventType,
      entityType: "Payment",
      entityId: payment.id,
      after: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: payment.amount.toString(),
        method: payment.method,
        reference: payment.reference,
        paymentStatus: updatedInvoice.paymentStatus,
        paidTotal: totalsAfter.paidTotal.toFixed(2),
        balanceDue: totalsAfter.balanceDue.toFixed(2),
        inventoryMovementCount: inventoryMovements.length,
      },
      metadata: {
        module: "payments",
      },
    });

    return payment;
  });
}

async function assertInvoiceInventoryCanBeDiscounted(
  tx: Prisma.TransactionClient,
  invoice: InvoiceWithInventory,
) {
  const existingMovement = await tx.inventoryMovement.findFirst({
    where: {
      referenceType: "INVOICE",
      referenceId: invoice.id,
    },
    select: {
      id: true,
    },
  });

  if (existingMovement) {
    return;
  }

  for (const item of invoice.items) {
    if (!shouldDiscountInventory(item)) {
      continue;
    }

    const inventoryItem = item.catalogItem?.inventoryItem;

    if (!inventoryItem) {
      throw new Error(`No hay inventario configurado para ${item.catalogItem?.name ?? item.description}.`);
    }

    if (inventoryItem.quantityOnHand < item.quantity) {
      throw new Error(`No hay stock suficiente para ${item.catalogItem?.name ?? item.description}.`);
    }
  }
}

async function discountInvoiceInventory(
  tx: Prisma.TransactionClient,
  invoice: InvoiceWithInventory,
  actorUserId: string | null,
) {
  const existingMovement = await tx.inventoryMovement.findFirst({
    where: {
      referenceType: "INVOICE",
      referenceId: invoice.id,
    },
    select: {
      id: true,
    },
  });

  if (existingMovement) {
    return [];
  }

  const movements = [];

  for (const item of invoice.items) {
    if (!shouldDiscountInventory(item)) {
      continue;
    }

    const inventoryItem = item.catalogItem?.inventoryItem;

    if (!inventoryItem) {
      throw new Error(`No hay inventario configurado para ${item.catalogItem?.name ?? item.description}.`);
    }

    if (inventoryItem.quantityOnHand < item.quantity) {
      throw new Error(`No hay stock suficiente para ${item.catalogItem?.name ?? item.description}.`);
    }

    await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantityOnHand: inventoryItem.quantityOnHand - item.quantity,
      },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        type: InventoryMovementType.OUT,
        quantity: item.quantity,
        reason: "Factura pagada",
        referenceType: "INVOICE",
        referenceId: invoice.id,
        notes: `Inventario descontado por factura ${invoice.invoiceNumber}.`,
      },
    });

    movements.push(movement);
  }

  if (movements.length > 0) {
    await tx.integrationEvent.create({
      data: {
        type: "inventory.discounted",
        aggregateType: "Invoice",
        aggregateId: invoice.id,
        payload: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          movementCount: movements.length,
          reason: "Factura pagada",
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId,
      action: "inventory.discounted",
      entityType: "Invoice",
      entityId: invoice.id,
      after: {
        invoiceNumber: invoice.invoiceNumber,
        movementCount: movements.length,
      },
      metadata: {
        module: "inventory",
        reason: "Factura pagada",
      },
    });
  }

  return movements;
}

function shouldDiscountInventory(item: InvoiceWithInventory["items"][number]) {
  return (
    Boolean(item.catalogItemId) &&
    item.catalogItem?.trackInventory === true &&
    (item.itemType === ProductType.PRODUCT || item.itemType === ProductType.PART)
  );
}

type InvoiceWithInventory = Prisma.InvoiceGetPayload<{
  include: {
    payments: true;
    items: {
      include: {
        catalogItem: {
          include: {
            inventoryItem: true;
          };
        };
      };
    };
  };
}>;

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

function paymentStatusForBalance(paidTotal: number, invoiceTotal: number) {
  if (paidTotal <= 0) {
    return PaymentStatus.UNPAID;
  }

  if (paidTotal >= invoiceTotal) {
    return PaymentStatus.PAID;
  }

  return PaymentStatus.PARTIALLY_PAID;
}

function invoiceStatusForPaymentStatus(status: PaymentStatus) {
  if (status === PaymentStatus.PAID) {
    return InvoiceStatus.PAID;
  }

  if (status === PaymentStatus.PARTIALLY_PAID) {
    return InvoiceStatus.PARTIALLY_PAID;
  }

  return InvoiceStatus.UNPAID;
}
