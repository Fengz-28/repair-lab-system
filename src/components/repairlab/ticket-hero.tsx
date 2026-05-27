import Link from "next/link";
import type React from "react";

import { RepairBadge, RepairButton, RepairContainer } from "@/components/repairlab";

export function TicketHero({
  ticketNumber,
  title,
  customerName,
  deviceLabel,
  status,
  createdAt,
  children,
}: {
  ticketNumber: string;
  title: string;
  customerName: string;
  deviceLabel: string;
  status: string;
  createdAt: Date;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.24),transparent_30%),radial-gradient(circle_at_82%_5%,rgba(6,182,212,0.16),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(0,0,0,0.86))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_48%,rgba(255,255,255,0.08)_49%,transparent_50%)] [background-size:44px_44px]" />
      <RepairContainer className="relative py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
          <Link className="hover:text-white" href="/admin/tickets">Tickets</Link>
          <span>/</span>
          <span>{ticketNumber}</span>
        </div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <RepairBadge tone="emerald">{status}</RepairBadge>
              <span className="rounded-full border border-white/15 bg-zinc-900/45 px-3 py-1 text-xs font-semibold text-zinc-200">
                Ingreso {createdAt.toLocaleDateString("es-CR")}
              </span>
            </div>
            <h1 className="mt-4 break-words text-3xl font-black tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
              {customerName} / {deviceLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <RepairButton href="/admin/tickets" tone="secondary" size="sm">Volver</RepairButton>
            <RepairButton href="/admin/intake" tone="ghost" size="sm">Recepcion</RepairButton>
          </div>
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </RepairContainer>
    </section>
  );
}
