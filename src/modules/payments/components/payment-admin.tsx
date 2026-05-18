"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

import { registerManualPaymentAction } from "@/app/admin/tickets/[ticketId]/invoices/[invoiceId]/actions";
import { initialTicketActionState } from "@/modules/tickets/ticket.action-state";

type PaymentRecord = {
  id: string;
  amount: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  createdAt: string;
};

export function PaymentAdmin({
  ticketId,
  invoiceId,
  currency,
  invoiceTotal,
  paidTotal,
  balanceDue,
  paymentStatus,
  payments,
}: {
  ticketId: string;
  invoiceId: string;
  currency: string;
  invoiceTotal: string;
  paidTotal: string;
  balanceDue: string;
  paymentStatus: PaymentStatus;
  payments: PaymentRecord[];
}) {
  const isPaid = Number(balanceDue) <= 0;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <FinancialSummary
          currency={currency}
          invoiceTotal={invoiceTotal}
          paidTotal={paidTotal}
          balanceDue={balanceDue}
          paymentStatus={paymentStatus}
        />
        <PaymentHistory payments={payments} currency={currency} />
      </div>
      <RegisterPaymentForm
        ticketId={ticketId}
        invoiceId={invoiceId}
        balanceDue={balanceDue}
        disabled={isPaid}
      />
    </section>
  );
}

function FinancialSummary({
  currency,
  invoiceTotal,
  paidTotal,
  balanceDue,
  paymentStatus,
}: {
  currency: string;
  invoiceTotal: string;
  paidTotal: string;
  balanceDue: string;
  paymentStatus: PaymentStatus;
}) {
  return (
    <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Resumen financiero</h2>
        <PaymentStatusBadge status={paymentStatus} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryBox label="Total factura" value={`${currency} ${invoiceTotal}`} />
        <SummaryBox label="Total pagado" value={`${currency} ${paidTotal}`} />
        <SummaryBox label="Saldo pendiente" value={`${currency} ${balanceDue}`} />
      </div>
    </section>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
      <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function RegisterPaymentForm({
  ticketId,
  invoiceId,
  balanceDue,
  disabled,
}: {
  ticketId: string;
  invoiceId: string;
  balanceDue: string;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(
    registerManualPaymentAction,
    initialTicketActionState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Registrar pago</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Registra pagos internos manuales. No procesa dinero ni contacta proveedores externos.
        </p>
      </div>
      {disabled ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Esta factura ya esta pagada.
        </p>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Monto
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              max={balanceDue}
              required
              className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Metodo de pago
            <select
              name="method"
              defaultValue="CASH"
              className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="SINPE">SINPE</option>
              <option value="OTHER">Otro</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Referencia
            <input
              name="reference"
              placeholder="Opcional"
              className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Notas internas
            <textarea
              name="notes"
              rows={3}
              placeholder="Opcional"
              className="rounded border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </label>
          <ActionMessage ok={state.ok} message={state.message} />
          <SubmitButton />
        </>
      )}
    </form>
  );
}

function PaymentHistory({
  payments,
  currency,
}: {
  payments: PaymentRecord[];
  currency: string;
}) {
  return (
    <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Historial de pagos</h2>
      {payments.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay pagos registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Fecha</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Monto</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Metodo</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Referencia</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Notas</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="px-3 py-2">{payment.createdAt}</td>
                  <td className="px-3 py-2">{currency} {payment.amount}</td>
                  <td className="px-3 py-2">{paymentMethodLabel(payment.method)}</td>
                  <td className="px-3 py-2">{payment.reference ?? "-"}</td>
                  <td className="px-3 py-2">{payment.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    UNPAID: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    PARTIALLY_PAID: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    REFUNDED: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
    VOID: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
  };

  return (
    <span className={`inline-flex rounded border px-3 py-1 text-xs font-medium ${classes[status]}`}>
      {paymentStatusLabel(status)}
    </span>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300"
    >
      {pending ? "Registrando..." : "Registrar pago"}
    </button>
  );
}

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`rounded border p-2 text-sm ${
        ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
      role="status"
    >
      {message}
    </p>
  );
}

function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    UNPAID: "Pendiente",
    PARTIALLY_PAID: "Parcialmente pagada",
    PAID: "Pagada",
    REFUNDED: "Reembolsada",
    VOID: "Anulada",
  };

  return labels[status] ?? status;
}

function paymentMethodLabel(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    SINPE: "SINPE",
    OTHER: "Otro",
  };

  return labels[method] ?? method;
}
