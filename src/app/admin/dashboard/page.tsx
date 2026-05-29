import Link from "next/link";
import type React from "react";

import { AdminNav } from "@/components/admin-nav";
import {
  RepairButton,
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairPanel,
  RepairStatCard,
} from "@/components/repairlab";
import {
  getDashboardData,
  inventoryMovementLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  quoteStatusLabel,
  ticketStatusLabel,
} from "@/modules/dashboard/dashboard.service";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireLocalStaff();
  const dashboard = await getDashboardData();

  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Dashboard"
        title="Panel operativo del taller"
        description="Vista ejecutiva para priorizar trabajo activo, aprobaciones pendientes, cobros, entregas e inventario crítico."
        actions={
          <>
            <RepairButton href="/admin/intake">Nueva recepción</RepairButton>
            <RepairButton href="/admin/tickets" tone="secondary">Ver tickets</RepairButton>
          </>
        }
      />

      <RepairContainer className="space-y-8 py-8 sm:py-10">
        <RepairGrid className="md:grid-cols-2 xl:grid-cols-4">
          <RepairStatCard label="Tickets abiertos" value={dashboard.tickets.open} />
          <RepairStatCard label="Esperando aprobación" value={dashboard.tickets.waitingApproval} tone="cyan" />
          <RepairStatCard label="Ingresos registrados" value={formatMoney(dashboard.payments.receivedTotal)} tone="emerald" />
          <RepairStatCard label="Saldo pendiente" value={formatMoney(dashboard.invoices.balanceDue)} tone="warning" />
        </RepairGrid>

        <RepairPanel className="border-cyan-300/15 bg-zinc-950/85">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
            Prioridades operativas
          </p>
          <div className="mt-3 grid gap-2 text-sm text-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3">
              <p className="font-bold text-zinc-50">Atención inmediata</p>
              <p className="mt-1 text-zinc-400">Tickets en diagnóstico o espera de aprobación.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3">
              <p className="font-bold text-zinc-50">Cobros pendientes</p>
              <p className="mt-1 text-zinc-400">Facturas con saldo para seguimiento activo.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3 sm:col-span-2 lg:col-span-1">
              <p className="font-bold text-zinc-50">Inventario crítico</p>
              <p className="mt-1 text-zinc-400">Ítems con stock bajo que pueden frenar reparaciones.</p>
            </div>
          </div>
        </RepairPanel>

        <RepairGrid className="gap-6 xl:grid-cols-2">
          <MetricPanel
            title="Tickets"
            items={[
              ["Total de tickets", dashboard.tickets.total],
              ["Tickets abiertos", dashboard.tickets.open],
              ["Tickets entregados", dashboard.tickets.delivered],
              ["En diagnóstico", dashboard.tickets.diagnosis],
              ["Esperando aprobación", dashboard.tickets.waitingApproval],
              ["Listos para reparación", dashboard.tickets.approved],
              ["En reparación", dashboard.tickets.inRepair],
              ["Listos para entrega", dashboard.tickets.readyForPickup],
            ]}
          />
          <MetricPanel
            title="Cotizaciones"
            items={[
              ["Total de cotizaciones", dashboard.quotes.total],
              ["Borrador", dashboard.quotes.draft],
              ["Enviadas", dashboard.quotes.sent],
              ["Aprobadas", dashboard.quotes.approved],
              ["Rechazadas", dashboard.quotes.rejected],
              ["Expiradas", dashboard.quotes.expired],
              ["Monto total cotizado", formatMoney(dashboard.quotes.quotedTotal)],
              ["Monto total aprobado", formatMoney(dashboard.quotes.approvedTotal)],
            ]}
          />
          <MetricPanel
            title="Facturas"
            items={[
              ["Total de facturas", dashboard.invoices.total],
              ["Pagadas", dashboard.invoices.paid],
              ["Pendientes", dashboard.invoices.unpaid],
              ["Parcialmente pagadas", dashboard.invoices.partiallyPaid],
              ["Total facturado", formatMoney(dashboard.invoices.invoicedTotal)],
              ["Total pagado", formatMoney(dashboard.invoices.paidTotal)],
              ["Saldo pendiente", formatMoney(dashboard.invoices.balanceDue)],
            ]}
          />
          <MetricPanel
            title="Inventario"
            items={[
              ["Items de catálogo", dashboard.inventory.catalogItems],
              ["Controlan stock", dashboard.inventory.trackedItems],
              ["Stock bajo", dashboard.inventory.lowStock],
              ["Sin stock", dashboard.inventory.outOfStock],
              ["Valor estimado", formatMoney(dashboard.inventory.estimatedValue)],
            ]}
          />
        </RepairGrid>

        <RepairGrid className="gap-6 xl:grid-cols-2">
          <PaymentsPanel dashboard={dashboard} />
          <TicketsAttentionPanel tickets={dashboard.lists.ticketsNeedingAttention} />
          <PendingQuotesPanel quotes={dashboard.lists.pendingQuotes} />
          <PendingInvoicesPanel invoices={dashboard.lists.pendingInvoices} />
          <InventoryAlertsPanel items={dashboard.lists.inventoryAlerts} />
          <RecentMovementsPanel movements={dashboard.lists.recentMovements} />
        </RepairGrid>

        <RecentEventsPanel events={dashboard.lists.recentEvents} />
      </RepairContainer>
    </RepairPageShell>
  );
}

function MetricPanel({
  title,
  items,
}: {
  title: string;
  items: [string, string | number][];
}) {
  return (
    <RepairPanel>
      <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2 last:border-0">
            <dt className="min-w-0 text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="break-words font-medium text-zinc-950 dark:text-zinc-50">{value}</dd>
          </div>
        ))}
      </dl>
    </RepairPanel>
  );
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function PaymentsPanel({ dashboard }: { dashboard: DashboardData }) {
  return (
    <RepairPanel>
      <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">Pagos</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        <MetricRow label="Pagos registrados" value={dashboard.payments.count} />
        <MetricRow label="Total recibido" value={formatMoney(dashboard.payments.receivedTotal)} />
        <MetricRow label="Recibido hoy" value={formatMoney(dashboard.payments.receivedToday)} />
        <MetricRow label="Recibido este mes" value={formatMoney(dashboard.payments.receivedThisMonth)} />
      </dl>
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Pagos por metodo</h3>
        {dashboard.payments.byMethod.length === 0 ? (
          <EmptyText>No hay pagos registrados.</EmptyText>
        ) : (
          dashboard.payments.byMethod.map((method) => (
          <div key={method.method} className="repair-card-motion flex flex-wrap justify-between gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 p-3 text-sm hover:border-cyan-300/30 hover:bg-zinc-900/80">
              <span>{paymentMethodLabel(method.method)}</span>
              <span className="break-words font-medium">{formatMoney(method.total)} ({method.count})</span>
            </div>
          ))
        )}
      </div>
    </RepairPanel>
  );
}

function TicketsAttentionPanel({
  tickets,
}: {
  tickets: DashboardData["lists"]["ticketsNeedingAttention"];
}) {
  return (
    <ListPanel title="Tickets que necesitan atención" empty="No hay tickets pendientes de atención.">
      {tickets.map((ticket) => (
        <ListItem key={ticket.id}>
          <div className="min-w-0">
            <Link className="font-medium underline" href={`/admin/tickets/${ticket.id}`}>
              {ticket.ticketNumber}
            </Link>
            <p className="break-words text-zinc-500 dark:text-zinc-400">{ticket.customerName} / {ticket.deviceLabel}</p>
          </div>
          <Badge>{ticketStatusLabel(ticket.status)}</Badge>
        </ListItem>
      ))}
    </ListPanel>
  );
}

function PendingQuotesPanel({
  quotes,
}: {
  quotes: DashboardData["lists"]["pendingQuotes"];
}) {
  return (
    <ListPanel title="Cotizaciones pendientes" empty="No hay cotizaciones pendientes.">
      {quotes.map((quote) => (
        <ListItem key={quote.id}>
          <div className="min-w-0">
            <Link className="font-medium underline" href={quote.ticketId ? `/admin/tickets/${quote.ticketId}/quotes` : "/admin/tickets"}>
              {quote.invoiceNumber}
            </Link>
            <p className="break-words text-zinc-500 dark:text-zinc-400">
              {quote.customerName} / {quote.ticketNumber} / {formatMoney(quote.total)}
            </p>
          </div>
          <Badge>{quoteStatusLabel(quote.status)}</Badge>
        </ListItem>
      ))}
    </ListPanel>
  );
}

function PendingInvoicesPanel({
  invoices,
}: {
  invoices: DashboardData["lists"]["pendingInvoices"];
}) {
  return (
    <ListPanel title="Facturas por cobrar" empty="No hay facturas pendientes.">
      {invoices.map((invoice) => (
        <ListItem key={invoice.id}>
          <div className="min-w-0">
            <Link
              className="font-medium underline"
              href={
                invoice.ticketId
                  ? `/admin/tickets/${invoice.ticketId}/invoices/${invoice.id}`
                  : "/admin/tickets"
              }
            >
              {invoice.invoiceNumber}
            </Link>
            <p className="break-words text-zinc-500 dark:text-zinc-400">
              {invoice.customerName} / saldo {formatMoney(invoice.balanceDue)}
            </p>
          </div>
          <Badge>{paymentStatusLabel(invoice.paymentStatus)}</Badge>
        </ListItem>
      ))}
    </ListPanel>
  );
}

function InventoryAlertsPanel({
  items,
}: {
  items: DashboardData["lists"]["inventoryAlerts"];
}) {
  return (
    <ListPanel title="Inventario en alerta" empty="No hay items con stock bajo.">
      {items.map((item) => (
        <ListItem key={item.id}>
          <div className="min-w-0">
            <Link className="font-medium underline" href="/admin/catalog">
              {item.name}
            </Link>
            <p className="break-words text-zinc-500 dark:text-zinc-400">
              Stock {item.quantityOnHand} / mínimo {item.reorderLevel}
            </p>
          </div>
          <Badge>{item.quantityOnHand <= 0 ? "Sin stock" : "Stock bajo"}</Badge>
        </ListItem>
      ))}
    </ListPanel>
  );
}

function RecentMovementsPanel({
  movements,
}: {
  movements: DashboardData["lists"]["recentMovements"];
}) {
  return (
    <ListPanel title="Últimos movimientos de inventario" empty="No hay movimientos de inventario.">
      {movements.map((movement) => (
        <ListItem key={movement.id}>
          <div className="min-w-0">
            <p className="break-words font-medium text-zinc-950 dark:text-zinc-50">{movement.itemName}</p>
            <p className="break-words text-zinc-500 dark:text-zinc-400">
              {movement.createdAt.toLocaleString("es-CR")} / {movement.reason ?? "Sin motivo"}
            </p>
          </div>
          <Badge>{inventoryMovementLabel(movement.type)} {movement.quantity}</Badge>
        </ListItem>
      ))}
    </ListPanel>
  );
}

function RecentEventsPanel({
  events,
}: {
  events: DashboardData["lists"]["recentEvents"];
}) {
  return (
    <ListPanel title="Últimos eventos" empty="No hay eventos recientes.">
      {events.map((event) => (
        <ListItem key={event.id}>
          <div className="min-w-0">
            <Link className="font-medium underline" href={`/admin/tickets/${event.ticketId}`}>
              {event.ticketNumber}
            </Link>
            <p className="break-words text-zinc-500 dark:text-zinc-400">{event.title}</p>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {event.createdAt.toLocaleString("es-CR")}
          </span>
        </ListItem>
      ))}
    </ListPanel>
  );
}

function ListPanel({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const isEmpty = Array.isArray(children) && children.length === 0;

  return (
    <RepairPanel>
      <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
      <div className="mt-3 space-y-2">
        {isEmpty ? <EmptyText>{empty}</EmptyText> : children}
      </div>
    </RepairPanel>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="repair-card-motion group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/80 p-3 text-sm shadow-sm shadow-black/20 hover:border-cyan-300/30 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-cyan-950/15">
      {children}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2 last:border-0">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="break-words font-medium text-zinc-950 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-100 shadow-sm shadow-black/20">
      <span className="size-1.5 rounded-full bg-cyan-300" />
      {children}
    </span>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
}

function formatMoney(value: number) {
  return `CRC ${value.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
