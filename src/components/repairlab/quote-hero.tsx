import Link from "next/link";

import { RepairBadge, RepairButton, RepairContainer } from "./index";

export function QuoteHero({
  ticketId,
  ticketNumber,
  customerName,
  deviceLabel,
  quoteCount,
  latestTotal,
  latestStatus,
}: {
  ticketId: string;
  ticketNumber: string;
  customerName: string;
  deviceLabel: string;
  quoteCount: number;
  latestTotal: string;
  latestStatus: string;
}) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.15),rgba(0,0,0,0.86))]" />
      <RepairContainer className="relative py-12 sm:py-16">
        <Link className="text-sm font-bold text-cyan-200 transition hover:text-white" href={`/admin/tickets/${ticketId}`}>
          Volver al ticket
        </Link>
        <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Ticket {ticketNumber} / Cotizaciones</p>
            <h1 className="mt-3 break-words text-4xl font-black tracking-tight sm:text-5xl">Propuestas de reparación</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Define precios, agrega líneas de mano de obra o repuestos y controla aprobaciones sin mezclarlo con el estado técnico del ticket.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RepairBadge tone="cyan">{customerName}</RepairBadge>
              <RepairBadge tone="cyan">{deviceLabel}</RepairBadge>
              <RepairBadge tone="violet">{quoteCount} cotizaciones</RepairBadge>
            </div>
          </div>
          <div className="w-full rounded-3xl border border-white/10 bg-zinc-900/45 p-5 shadow-2xl shadow-black/20 backdrop-blur lg:max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Última cotización</p>
            <p className="mt-3 break-words text-3xl font-black">{latestTotal}</p>
            <p className="mt-2 text-sm text-zinc-300">Estado: {latestStatus}</p>
            <div className="mt-5">
              <RepairButton href="#crear-cotizacion" tone="primary">Crear cotización</RepairButton>
            </div>
          </div>
        </div>
      </RepairContainer>
    </section>
  );
}

