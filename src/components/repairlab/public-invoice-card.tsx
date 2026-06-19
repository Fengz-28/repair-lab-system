import type { PaymentStatus } from "@prisma/client";

import { formatMoney, paymentStatusLabel } from "@/modules/customer-portal/tracking-labels";
import { ReceiptText, Wallet } from "lucide-react";

import { RepairBadge, RepairButton } from "./index";

type PublicInvoice = {
  invoiceNumber: string;
  paymentStatus: PaymentStatus;
  currency: string;
  total: unknown;
  paidTotal: unknown;
  balanceDue: unknown;
};

export function InvoicePublicCard({ invoice, token }: { invoice: PublicInvoice; token: string }) {
  const isPaid = invoice.paymentStatus === "PAID";

  return (
    <section className="fengz-carbon-panel fengz-rgb-edge repair-premium-card rounded-3xl border border-white/10 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            <ReceiptText className="size-3.5" />
            Factura interna
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-50">{invoice.invoiceNumber}</h2>
        </div>
        <RepairBadge tone={isPaid ? "cyan" : invoice.paymentStatus === "PARTIALLY_PAID" ? "warning" : "danger"}>
          {paymentStatusLabel(invoice.paymentStatus)}
        </RepairBadge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <FinancialTile label="Total" value={formatMoney(invoice.currency, moneyValue(invoice.total))} />
        <FinancialTile label="Pagado" value={formatMoney(invoice.currency, moneyValue(invoice.paidTotal))} tone="cyan" />
        <FinancialTile label="Saldo pendiente" value={formatMoney(invoice.currency, moneyValue(invoice.balanceDue))} tone={isPaid ? "neutral" : "warning"} />
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
        <Wallet className="size-3.5 text-cyan-300" />
        Resumen financiero del caso
      </div>
      <div className="mt-3">
        <RepairButton href={`/track/${token}/invoice.pdf`} tone="primary">
          Descargar factura PDF
        </RepairButton>
      </div>
    </section>
  );
}

function FinancialTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "cyan" | "warning";
}) {
  const toneClass = {
    neutral: "border-white/10 bg-zinc-950/75",
    cyan: "border-cyan-300/20 bg-cyan-500/10",
    warning: "border-amber-300/25 bg-amber-500/10",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
      <p className="mt-2 break-words text-xl font-black text-zinc-50">{value}</p>
    </div>
  );
}

function moneyValue(value: unknown) {
  return value as { toString(): string } | number | string;
}

