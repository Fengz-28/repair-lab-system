import Link from "next/link";
import type { TicketStatus } from "@prisma/client";

import { formatMoney, ticketStatusLabel } from "@/modules/customers/customer-labels";

import { RepairBadge, RepairButton } from "./index";

export type CustomerSummaryCardData = {
  id: string;
  name: string;
  contact: string;
  ticketCount: number;
  deviceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
  latestTicket: {
    id: string;
    ticketNumber: string;
    status: TicketStatus;
    deviceLabel: string;
    createdAt: Date;
  } | null;
};

export function CustomerSummaryCard({ customer }: { customer: CustomerSummaryCardData }) {
  const initials = customer.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CL";

  return (
    <article className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900">
            {initials}
          </div>
          <div className="min-w-0">
            <Link
              className="break-words text-xl font-black text-zinc-950 transition hover:text-emerald-600 dark:text-zinc-50 dark:hover:text-emerald-300"
              href={`/admin/customers/${customer.id}`}
            >
              {customer.name}
            </Link>
            <p className="mt-1 break-words text-sm font-medium text-zinc-500 dark:text-zinc-400">{customer.contact}</p>
          </div>
        </div>
        <RepairBadge tone={customer.balanceDue > 0 ? "warning" : "emerald"}>
          {customer.balanceDue > 0 ? "Saldo pendiente" : "Sin saldo"}
        </RepairBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Tickets" value={customer.ticketCount} />
        <Metric label="Equipos" value={customer.deviceCount} />
        <Metric label="Saldo" value={formatMoney(customer.balanceDue)} highlight={customer.balanceDue > 0} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Financial label="Facturado" value={formatMoney(customer.totalInvoiced)} />
        <Financial label="Pagado" value={formatMoney(customer.totalPaid)} tone="emerald" />
      </div>

      {customer.latestTicket ? (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Ultimo ticket
              </p>
              <p className="mt-2 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">
                {customer.latestTicket.ticketNumber}
              </p>
              <p className="mt-1 break-words text-sm text-zinc-600 dark:text-zinc-300">
                {customer.latestTicket.deviceLabel} / {customer.latestTicket.createdAt.toLocaleDateString("es-CR")}
              </p>
            </div>
            <RepairBadge tone="cyan">{ticketStatusLabel(customer.latestTicket.status)}</RepairBadge>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
        <RepairButton href={`/admin/customers/${customer.id}`} size="sm">
          Ver cliente
        </RepairButton>
        <RepairButton href={`/admin/tickets?search=${encodeURIComponent(customer.name)}`} tone="secondary" size="sm">
          Ver tickets
        </RepairButton>
      </div>
    </article>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={highlight ? "mt-1 break-words text-sm font-black text-amber-700 dark:text-amber-200" : "mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50"}>{value}</p>
    </div>
  );
}

function Financial({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "emerald" }) {
  return (
    <div className={tone === "emerald"
      ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/50"
      : "rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/70"}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}
