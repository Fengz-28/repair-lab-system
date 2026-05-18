import Link from "next/link";
import type React from "react";

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
    <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <header className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Admin / Dashboard</p>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Panel operativo del taller
          </h1>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
            Resumen de tickets, cotizaciones, facturas, pagos e inventario para entender que requiere atencion.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickLink href="/admin/intake" label="Nueva recepcion" primary />
          <QuickLink href="/admin/tickets" label="Ver tickets" />
          <QuickLink href="/admin/catalog" label="Ver catalogo" />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tickets abiertos" value={dashboard.tickets.open} />
        <KpiCard label="Esperando aprobacion" value={dashboard.tickets.waitingApproval} />
        <KpiCard label="Ingresos registrados" value={formatMoney(dashboard.payments.receivedTotal)} />
        <KpiCard label="Saldo pendiente" value={formatMoney(dashboard.invoices.balanceDue)} tone="warning" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <MetricPanel
          title="Tickets"
          items={[
            ["Total de tickets", dashboard.tickets.total],
            ["Tickets abiertos", dashboard.tickets.open],
            ["Tickets entregados", dashboard.tickets.delivered],
            ["En diagnostico", dashboard.tickets.diagnosis],
            ["Esperando aprobacion", dashboard.tickets.waitingApproval],
            ["Listos para reparacion", dashboard.tickets.approved],
            ["En reparacion", dashboard.tickets.inRepair],
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
            ["Items de catalogo", dashboard.inventory.catalogItems],
            ["Controlan stock", dashboard.inventory.trackedItems],
            ["Stock bajo", dashboard.inventory.lowStock],
            ["Sin stock", dashboard.inventory.outOfStock],
            ["Valor estimado", formatMoney(dashboard.inventory.estimatedValue)],
          ]}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PaymentsPanel dashboard={dashboard} />
        <TicketsAttentionPanel tickets={dashboard.lists.ticketsNeedingAttention} />
        <PendingQuotesPanel quotes={dashboard.lists.pendingQuotes} />
        <PendingInvoicesPanel invoices={dashboard.lists.pendingInvoices} />
        <InventoryAlertsPanel items={dashboard.lists.inventoryAlerts} />
        <RecentMovementsPanel movements={dashboard.lists.recentMovements} />
      </section>

      <RecentEventsPanel events={dashboard.lists.recentEvents} />
    </main>
  );
}

function QuickLink({
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
          ? "rounded bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
          : "rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
      }
      href={href}
    >
      {label}
    </Link>
  );
}

function KpiCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning";
}) {
  const classes =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <article className={`rounded border p-4 ${classes}`}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </article>
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
    <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="font-medium text-zinc-950 dark:text-zinc-50">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function PaymentsPanel({ dashboard }: { dashboard: DashboardData }) {
  return (
    <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Pagos</h2>
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
            <div key={method.method} className="flex justify-between gap-3 rounded border border-zinc-100 p-2 text-sm dark:border-zinc-800">
              <span>{paymentMethodLabel(method.method)}</span>
              <span className="font-medium">{formatMoney(method.total)} ({method.count})</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TicketsAttentionPanel({
  tickets,
}: {
  tickets: DashboardData["lists"]["ticketsNeedingAttention"];
}) {
  return (
    <ListPanel title="Tickets que necesitan atencion" empty="No hay tickets pendientes de atencion.">
      {tickets.map((ticket) => (
        <ListItem key={ticket.id}>
          <div>
            <Link className="font-medium underline" href={`/admin/tickets/${ticket.id}`}>
              {ticket.ticketNumber}
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400">{ticket.customerName} / {ticket.deviceLabel}</p>
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
          <div>
            <Link className="font-medium underline" href={quote.ticketId ? `/admin/tickets/${quote.ticketId}/quotes` : "/admin/tickets"}>
              {quote.invoiceNumber}
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400">
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
          <div>
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
            <p className="text-zinc-500 dark:text-zinc-400">
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
          <div>
            <Link className="font-medium underline" href="/admin/catalog">
              {item.name}
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400">
              Stock {item.quantityOnHand} / minimo {item.reorderLevel}
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
    <ListPanel title="Ultimos movimientos de inventario" empty="No hay movimientos de inventario.">
      {movements.map((movement) => (
        <ListItem key={movement.id}>
          <div>
            <p className="font-medium text-zinc-950 dark:text-zinc-50">{movement.itemName}</p>
            <p className="text-zinc-500 dark:text-zinc-400">
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
    <ListPanel title="Ultimos eventos" empty="No hay eventos recientes.">
      {events.map((event) => (
        <ListItem key={event.id}>
          <div>
            <Link className="font-medium underline" href={`/admin/tickets/${event.ticketId}`}>
              {event.ticketNumber}
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400">{event.title}</p>
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
    <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
      <div className="mt-3 space-y-2">
        {isEmpty ? <EmptyText>{empty}</EmptyText> : children}
      </div>
    </section>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-100 p-3 text-sm dark:border-zinc-800">
      {children}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium text-zinc-950 dark:text-zinc-50">{value}</dd>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
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
