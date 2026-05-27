import type { InvoiceStatus, ProductType } from "@prisma/client";

import { formatMoney, itemTypeLabel, quoteStatusLabel } from "@/modules/customer-portal/tracking-labels";

import { RepairBadge, RepairButton } from "./index";

type PublicQuote = {
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: unknown;
  taxTotal: unknown;
  total: unknown;
  customerNotes: string | null;
  items: {
    itemType: ProductType;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
    lineTotal: unknown;
  }[];
};

export function QuotePublicCard({ quote, token }: { quote: PublicQuote; token: string }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Cotizacion
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">{quote.invoiceNumber}</h2>
        </div>
        <RepairBadge tone={quote.status === "APPROVED" ? "emerald" : "violet"}>
          {quoteStatusLabel(quote.status)}
        </RepairBadge>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-zinc-950/95 text-zinc-300">
              <tr>
                <TableHeader>Tipo</TableHeader>
                <TableHeader>Descripcion</TableHeader>
                <TableHeader>Cantidad</TableHeader>
                <TableHeader>Unitario</TableHeader>
                <TableHeader>Total</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {quote.items.map((item, index) => (
                <tr key={`${item.description}-${index}`} className="text-zinc-800 dark:text-zinc-200">
                  <td className="px-4 py-3">{itemTypeLabel(item.itemType)}</td>
                  <td className="px-4 py-3 break-words font-semibold">{item.description}</td>
                  <td className="px-4 py-3">{String(item.quantity)}</td>
                  <td className="px-4 py-3">{formatMoney(quote.currency, moneyValue(item.unitPrice))}</td>
                  <td className="px-4 py-3 font-bold">{formatMoney(quote.currency, moneyValue(item.lineTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100">
          {quote.customerNotes ? quote.customerNotes : "Precios sujetos a disponibilidad y validacion final del taller."}
        </div>
        <Totals
          rows={[
            ["Subtotal", formatMoney(quote.currency, moneyValue(quote.subtotal))],
            ["Impuestos", formatMoney(quote.currency, moneyValue(quote.taxTotal))],
            ["Total estimado", formatMoney(quote.currency, moneyValue(quote.total))],
          ]}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <RepairButton href={`/track/${token}/quote.pdf`} tone="primary">
          Descargar cotizacion PDF
        </RepairButton>
        <span className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300">
          La aprobacion en linea se implementara proximamente.
        </span>
      </div>
    </section>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">{children}</th>;
}

function Totals({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap justify-between gap-3 border-b border-white/10 py-2 last:border-0">
          <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
          <dd className="font-black text-zinc-950 dark:text-zinc-50">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function moneyValue(value: unknown) {
  return value as { toString(): string } | number | string;
}
