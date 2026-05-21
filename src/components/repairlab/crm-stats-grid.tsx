import { formatMoney } from "@/modules/customers/customer-labels";

import { RepairStatCard } from "./index";

type CustomerCRMStatsInput = {
  ticketCount: number;
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
};

export function CustomerCRMStats({ customers }: { customers: CustomerCRMStatsInput[] }) {
  const totals = customers.reduce(
    (summary, customer) => {
      summary.clients += 1;
      summary.tickets += customer.ticketCount;
      summary.invoiced += customer.totalInvoiced;
      summary.paid += customer.totalPaid;
      summary.balance += customer.balanceDue;
      if (customer.balanceDue > 0) {
        summary.withBalance += 1;
      }
      return summary;
    },
    { clients: 0, tickets: 0, invoiced: 0, paid: 0, balance: 0, withBalance: 0 },
  );

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <RepairStatCard label="Clientes" value={totals.clients} tone="emerald" />
      <RepairStatCard label="Tickets asociados" value={totals.tickets} tone="cyan" />
      <RepairStatCard label="Facturado" value={formatMoney(totals.invoiced)} tone="neutral" />
      <RepairStatCard label="Pagado" value={formatMoney(totals.paid)} tone="emerald" />
      <RepairStatCard label="Saldo pendiente" value={formatMoney(totals.balance)} tone={totals.balance > 0 ? "warning" : "neutral"} />
    </section>
  );
}
