import Link from "next/link";

import { RepairBadge, RepairButton, RepairContainer } from "./index";

export function InvoiceHero({
  ticketId,
  invoiceNumber,
  ticketNumber,
  customerName,
  paymentStatus,
  total,
  paid,
  balance,
  pdfHref,
}: {
  ticketId: string;
  invoiceNumber: string;
  ticketNumber: string;
  customerName: string;
  paymentStatus: string;
  total: string;
  paid: string;
  balance: string;
  pdfHref: string;
}) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.15),rgba(0,0,0,0.86))]" />
      <RepairContainer className="relative py-12 sm:py-16">
        <Link className="text-sm font-bold text-emerald-200 transition hover:text-white" href={`/admin/tickets/${ticketId}`}>
          Volver al ticket
        </Link>
        <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Billing / {invoiceNumber}</p>
            <h1 className="mt-3 break-words text-4xl font-black tracking-tight sm:text-5xl">Factura interna</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Gestiona líneas facturadas, pagos manuales y saldo pendiente para el ticket {ticketNumber}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RepairBadge tone="emerald">{customerName}</RepairBadge>
              <RepairBadge tone="cyan">Ticket {ticketNumber}</RepairBadge>
              <RepairBadge tone="warning">{paymentStatus}</RepairBadge>
            </div>
          </div>
          <div className="w-full rounded-3xl border border-white/10 bg-zinc-900/45 p-5 shadow-2xl shadow-black/20 backdrop-blur lg:max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Resumen financiero</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroMetric label="Total" value={total} />
              <HeroMetric label="Pagado" value={paid} />
              <HeroMetric label="Saldo" value={balance} />
            </div>
            <div className="mt-5">
              <RepairButton href={pdfHref} tone="primary">Descargar PDF</RepairButton>
            </div>
          </div>
        </div>
      </RepairContainer>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/45 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-white">{value}</p>
    </div>
  );
}
