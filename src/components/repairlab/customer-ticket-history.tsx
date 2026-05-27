import Link from "next/link";
import type { InvoiceStatus, PaymentStatus, TicketStatus } from "@prisma/client";

import {
  formatMoney,
  paymentStatusLabel,
  ticketStatusLabel,
} from "@/modules/customers/customer-labels";

import { RepairBadge, RepairButton, RepairPanel } from "./index";

type CustomerTicket = {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  problem: string;
  deviceLabel: string;
  createdAt: Date;
  quotes: { id: string; status: InvoiceStatus }[];
  invoice: { id: string; paymentStatus: PaymentStatus } | null;
  totals: {
    invoiceTotal: number;
    balanceDue: number;
  } | null;
};

export function CustomerTicketHistory({ tickets }: { tickets: CustomerTicket[] }) {
  return (
    <RepairPanel className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
          Historial tecnico
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Tickets del cliente</h2>
      </div>
      {tickets.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm text-zinc-400">
          No hay tickets para este cliente.
        </p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-3xl border border-white/10 bg-zinc-950/75 p-4 transition hover:border-cyan-300/35 hover:bg-zinc-900/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      className="break-words text-lg font-black text-zinc-950 transition hover:text-emerald-600 dark:text-zinc-50 dark:hover:text-emerald-300"
                      href={`/admin/tickets/${ticket.id}`}
                    >
                      {ticket.ticketNumber}
                    </Link>
                    <RepairBadge tone={ticket.status === "DELIVERED" ? "emerald" : ticket.status === "CANCELLED" ? "danger" : "cyan"}>
                      {ticketStatusLabel(ticket.status)}
                    </RepairBadge>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold text-zinc-700 dark:text-zinc-200">{ticket.deviceLabel}</p>
                  <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-zinc-500 dark:text-zinc-400">{ticket.problem}</p>
                  <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Ingreso {ticket.createdAt.toLocaleDateString("es-CR")}
                  </p>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 p-4 lg:max-w-xs">
                  {ticket.invoice && ticket.totals ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-zinc-500 dark:text-zinc-400">Total</span>
                        <span className="font-black text-zinc-950 dark:text-zinc-50">{formatMoney(ticket.totals.invoiceTotal)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-zinc-500 dark:text-zinc-400">Saldo</span>
                        <span className={ticket.totals.balanceDue > 0 ? "font-black text-amber-700 dark:text-amber-200" : "font-black text-emerald-700 dark:text-emerald-200"}>
                          {formatMoney(ticket.totals.balanceDue)}
                        </span>
                      </div>
                      <RepairBadge tone={ticket.totals.balanceDue > 0 ? "warning" : "emerald"}>
                        {paymentStatusLabel(ticket.invoice.paymentStatus)}
                      </RepairBadge>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Sin factura</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                <RepairButton href={`/admin/tickets/${ticket.id}`} size="sm">
                  Abrir ticket
                </RepairButton>
                <RepairButton href={`/admin/tickets/${ticket.id}/quotes`} tone="secondary" size="sm">
                  Cotizaciones
                </RepairButton>
                {ticket.invoice ? (
                  <>
                    <RepairButton href={`/admin/tickets/${ticket.id}/invoices/${ticket.invoice.id}`} tone="secondary" size="sm">
                      Factura
                    </RepairButton>
                    <RepairButton href={`/admin/tickets/${ticket.id}/invoices/${ticket.invoice.id}/pdf`} tone="ghost" size="sm">
                      PDF factura
                    </RepairButton>
                  </>
                ) : null}
                {ticket.quotes[0] ? (
                  <RepairButton href={`/admin/tickets/${ticket.id}/quotes/${ticket.quotes[0].id}/pdf`} tone="ghost" size="sm">
                    PDF cotizacion
                  </RepairButton>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </RepairPanel>
  );
}
