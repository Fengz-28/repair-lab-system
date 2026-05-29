import Link from "next/link";
import type { TicketStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import {
  RepairBadge,
  RepairButton,
  RepairCard,
  RepairContainer,
  RepairEmptyState,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSurface,
  RepairTable,
} from "@/components/repairlab";
import { getTicketListData, type TicketListSearchParams } from "@/modules/tickets/ticket-list.service";
import { getTicketStatusLabel, getTicketStatusTone } from "@/modules/tickets/ticket-status.presentation";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

type TicketListData = Awaited<ReturnType<typeof getTicketListData>>;
type TicketListItem = TicketListData["tickets"][number];

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<TicketListSearchParams>;
}) {
  await requireLocalStaff();
  const params = await searchParams;
  const { tickets, filters, lowStockCount } = await getTicketListData(params);

  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Tickets"
        title="Tickets de reparación"
        description="Centro operativo para buscar, priorizar y abrir reparaciones con acceso rápido a cotizaciones, facturas y PDFs."
        actions={
          <>
            <RepairButton href="/admin/intake">Nueva recepción</RepairButton>
            <RepairButton href="/admin/dashboard" tone="secondary">Panel</RepairButton>
          </>
        }
      />

      <RepairContainer className="space-y-6 py-8 sm:space-y-8 sm:py-10">
        {lowStockCount > 0 ? (
          <section className="repair-panel-reveal flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/25 bg-amber-500/10 p-4 text-sm text-amber-100 shadow-sm shadow-black/20">
            <p>
              <span className="font-bold">Bajo stock:</span> tienes {lowStockCount} items en o por debajo del mínimo.
            </p>
            <RepairButton href="/admin/catalog" tone="secondary" size="sm">
              Ver inventario
            </RepairButton>
          </section>
        ) : null}

        <RepairSurface>
          <TicketFilters filters={filters} />
        </RepairSurface>

        {tickets.length === 0 ? (
          <EmptyState hasFilters={Boolean(filters.search || filters.status !== "all")} />
        ) : filters.view === "table" ? (
          <TicketTable tickets={tickets} />
        ) : (
          <TicketCards tickets={tickets} />
        )}
      </RepairContainer>
    </RepairPageShell>
  );
}

function TicketFilters({ filters }: { filters: TicketListData["filters"] }) {
  return (
    <div>
      <form className="grid gap-3 lg:grid-cols-[1fr_220px_220px_160px_auto]">
        <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Buscar
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Ticket, cliente, teléfono, equipo o problema"
            className="min-h-11 rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-white placeholder:text-zinc-500 transition focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
        <SelectField
          label="Filtro"
          name="status"
          defaultValue={filters.status}
          options={[
            ["all", "Todos"],
            ["open", "Abiertos"],
            ["closed", "Cerrados/entregados"],
            ["diagnosis", "En diagnóstico"],
            ["waiting_approval", "Esperando aprobación"],
            ["ready_for_repair", "Listos para reparación"],
            ["invoice_pending", "Con factura pendiente"],
            ["invoice_paid", "Con factura pagada"],
            ["REPAIR_IN_PROGRESS", "En reparación"],
            ["READY_FOR_PICKUP", "Listos para entrega"],
          ]}
        />
        <SelectField
          label="Orden"
          name="sort"
          defaultValue={filters.sort}
          options={[
            ["recent", "Mas recientes"],
            ["oldest", "Mas antiguos"],
            ["invoiced_desc", "Mayor total facturado"],
            ["balance_desc", "Saldo pendiente mayor"],
          ]}
        />
        <SelectField
          label="Vista"
          name="view"
          defaultValue={filters.view}
          options={[
            ["cards", "Tarjetas"],
            ["table", "Tabla"],
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row lg:items-end">
          <button
            type="submit"
            className="repair-button-motion repair-focus-ring min-h-11 rounded-full border border-emerald-300/40 bg-emerald-500 px-5 py-2 text-sm font-black text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-cyan-400/20"
          >
            Aplicar
          </button>
          <Link
            className="repair-button-motion repair-focus-ring min-h-11 rounded-full border border-white/15 bg-zinc-800 px-5 py-2 text-center text-sm font-bold text-zinc-100 hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white"
            href="/admin/tickets"
          >
            Limpiar
          </Link>
        </div>
      </form>
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-11 rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm text-white transition focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TicketCards({ tickets }: { tickets: TicketListItem[] }) {
  return (
    <RepairGrid className="xl:grid-cols-2">
      {tickets.map((ticket) => (
        <RepairCard
          key={ticket.id}
          className="space-y-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link className="text-lg font-black text-zinc-950 underline decoration-emerald-400 underline-offset-4 dark:text-zinc-50" href={`/admin/tickets/${ticket.id}`}>
                {ticket.ticketNumber}
              </Link>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ingreso: {ticket.createdAt.toLocaleDateString("es-CR")}
              </p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoBlock label="Cliente" value={ticket.customerName} />
            <InfoBlock label="Contacto" value={ticket.contact} />
            <InfoBlock label="Equipo" value={ticket.deviceLabel} />
            <InfoBlock label="Cotizaciones" value={String(ticket.quotes.length)} />
          </div>

          <p className="line-clamp-3 break-words text-sm text-zinc-600 dark:text-zinc-300">
            {ticket.reportedIssue}
          </p>

          <FinancialSummary ticket={ticket} />
          <TicketActions ticket={ticket} />
        </RepairCard>
      ))}
    </RepairGrid>
  );
}

function TicketTable({ tickets }: { tickets: TicketListItem[] }) {
  return (
    <RepairTable>
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-950/95 text-zinc-300">
            <tr>
              <TableHeader>Ticket</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Equipo</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Finanzas</TableHeader>
              <TableHeader>Creado</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="repair-table-row border-b border-white/10 last:border-0 hover:border-cyan-300/20">
                <td className="px-3 py-3 font-medium text-zinc-950 dark:text-zinc-50">{ticket.ticketNumber}</td>
                <td className="px-3 py-3">
                  <p className="text-zinc-800 dark:text-zinc-200">{ticket.customerName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{ticket.contact}</p>
                </td>
                <td className="px-3 py-3 text-zinc-800 dark:text-zinc-200">{ticket.deviceLabel}</td>
                <td className="px-3 py-3"><StatusBadge status={ticket.status} /></td>
                <td className="px-3 py-3"><FinancialSummary ticket={ticket} compact /></td>
                <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">{ticket.createdAt.toLocaleDateString("es-CR")}</td>
                <td className="px-3 py-3"><TicketActions ticket={ticket} compact /></td>
              </tr>
            ))}
          </tbody>
        </table>
    </RepairTable>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-white/10 px-3 py-2">{children}</th>;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="break-words text-zinc-100">{value}</p>
    </div>
  );
}

function FinancialSummary({
  ticket,
  compact = false,
}: {
  ticket: TicketListItem;
  compact?: boolean;
}) {
  if (!ticket.invoice || !ticket.financials) {
    return (
      <div className={compact ? "text-xs text-zinc-500 dark:text-zinc-400" : "rounded-2xl border border-white/10 bg-zinc-950/70 p-3 text-sm"}>
        <p>Sin factura</p>
        {ticket.hasPendingQuote ? <p className="text-violet-600 dark:text-violet-300">Cotización pendiente</p> : null}
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-1 text-xs" : "grid gap-2 rounded-2xl border border-white/10 bg-zinc-950/70 p-3 text-sm sm:grid-cols-3"}>
      <Metric label="Facturado" value={formatMoney(ticket.financials.invoiceTotal)} />
      <Metric label="Pagado" value={formatMoney(ticket.financials.paidTotal)} />
      <Metric
        label="Saldo"
        value={formatMoney(ticket.financials.balanceDue)}
        highlight={ticket.financials.balanceDue > 0}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={highlight ? "font-semibold text-amber-700 dark:text-amber-200" : "font-medium text-zinc-950 dark:text-zinc-50"}>
        {value}
      </p>
    </div>
  );
}

function TicketActions({
  ticket,
  compact = false,
}: {
  ticket: TicketListItem;
  compact?: boolean;
}) {
  const latestQuote = ticket.latestQuote;
  const invoice = ticket.invoice;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "max-w-xs" : ""}`}>
      <ActionLink href={`/admin/tickets/${ticket.id}`} label="Abrir ticket" primary />
      <ActionLink href={`/admin/tickets/${ticket.id}/quotes`} label={`Cotizaciones (${ticket.quotes.length})`} />
      {latestQuote ? (
        <ActionLink href={`/admin/tickets/${ticket.id}/quotes/${latestQuote.id}/pdf`} label="PDF de cotización" />
      ) : null}
      {invoice ? (
        <>
          <ActionLink href={`/admin/tickets/${ticket.id}/invoices/${invoice.id}`} label="Factura" />
          <ActionLink href={`/admin/tickets/${ticket.id}/invoices/${invoice.id}/pdf`} label="PDF factura" />
        </>
      ) : null}
    </div>
  );
}

function ActionLink({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      className={
        primary
        ? "repair-button-motion repair-focus-ring min-h-10 rounded-full border border-emerald-300/40 bg-emerald-500 px-3 py-2 text-xs font-black text-black shadow-sm shadow-emerald-500/25 hover:bg-emerald-400"
        : "repair-button-motion repair-focus-ring min-h-10 rounded-full border border-white/15 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-100 hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white"
      }
      href={href}
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <RepairBadge tone={getTicketStatusTone(status)}>
      {getTicketStatusLabel(status)}
    </RepairBadge>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <RepairEmptyState
      title={hasFilters ? "No encontramos tickets con esos filtros." : "No hay tickets todavía."}
      description={
        hasFilters
          ? "Prueba limpiar filtros o buscar por cliente, equipo, teléfono o código de ticket."
          : "Empieza registrando una recepción. El sistema creará el ticket y lo conectará con cliente, equipo y seguimiento."
      }
      eyebrow={hasFilters ? "Búsqueda sin resultados" : "Primer ticket"}
      icon={hasFilters ? "FT" : "TK"}
      action={!hasFilters ? <RepairButton href="/admin/intake">Crear nueva recepción</RepairButton> : <RepairButton href="/admin/tickets">Limpiar filtros</RepairButton>}
      secondaryAction={!hasFilters ? <RepairButton href="/admin/dashboard" tone="secondary">Ver dashboard</RepairButton> : null}
    />
  );
}

function formatMoney(value: number) {
  return `CRC ${value.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
