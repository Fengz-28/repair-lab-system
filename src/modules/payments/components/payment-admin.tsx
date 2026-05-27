"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

import { registerManualPaymentAction } from "@/app/admin/tickets/[ticketId]/invoices/[invoiceId]/actions";
import { RepairPanel } from "@/components/repairlab";
import { RepairInventoryTable } from "@/components/repairlab/inventory-table";
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
    <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
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
    <RepairPanel className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Payment dashboard
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Resumen financiero</h2>
        </div>
        <PaymentStatusBadge status={paymentStatus} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryBox label="Total factura" value={`${currency} ${invoiceTotal}`} />
        <SummaryBox label="Total pagado" value={`${currency} ${paidTotal}`} />
        <SummaryBox label="Saldo pendiente" value={`${currency} ${balanceDue}`} />
      </div>
    </RepairPanel>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 break-words text-xl font-black text-zinc-950 dark:text-zinc-50">{value}</p>
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
    <form action={formAction} className="space-y-5 rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-sm shadow-black/25 lg:sticky lg:top-28">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
          Accion financiera
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Registrar pago</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Registra pagos internos manuales. No procesa dinero ni contacta proveedores externos.
        </p>
      </div>
      {disabled ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-sm font-semibold text-emerald-100">
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
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Metodo de pago
            <select
              name="method"
              defaultValue="CASH"
              className={fieldClassName}
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
              className={fieldClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Notas internas
            <textarea
              name="notes"
              rows={3}
              placeholder="Opcional"
              className={fieldClassName}
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
    <RepairPanel className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
          Actividad de pagos
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Historial de pagos</h2>
      </div>
      {payments.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-400">No hay pagos registrados.</p>
      ) : (
        <RepairInventoryTable>
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-zinc-950/95 text-zinc-300">
              <tr>
                <th className="border-b border-white/10 px-3 py-2">Fecha</th>
                <th className="border-b border-white/10 px-3 py-2">Monto</th>
                <th className="border-b border-white/10 px-3 py-2">Metodo</th>
                <th className="border-b border-white/10 px-3 py-2">Referencia</th>
                <th className="border-b border-white/10 px-3 py-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-zinc-100 transition last:border-0 hover:bg-emerald-50/50 dark:border-zinc-800 dark:hover:bg-emerald-950/20">
                  <td className="px-3 py-2">{payment.createdAt}</td>
                  <td className="px-3 py-2">{currency} {payment.amount}</td>
                  <td className="px-3 py-2">{paymentMethodLabel(payment.method)}</td>
                  <td className="px-3 py-2 break-words">{payment.reference ?? "-"}</td>
                  <td className="px-3 py-2 break-words">{payment.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </RepairInventoryTable>
      )}
    </RepairPanel>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    UNPAID: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    PARTIALLY_PAID: "border-cyan-400/30 bg-cyan-500/15 text-cyan-100",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    REFUNDED: "border-white/10 bg-zinc-900 text-zinc-200",
    VOID: "border-white/10 bg-zinc-900 text-zinc-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${classes[status]}`}>
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
      className="min-h-11 w-full rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:border disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none sm:w-auto"
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
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
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

const fieldClassName =
  "min-h-11 rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";
