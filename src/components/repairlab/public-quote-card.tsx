import type { InvoiceStatus, ProductType } from "@prisma/client";

import {
  formatMoney,
  itemTypeLabel,
  quoteStatusLabel,
} from "@/modules/customer-portal/tracking-labels";
import { FileText, PackageSearch, ReceiptText } from "lucide-react";

import { RepairBadge, RepairButton } from "@/components/repairlab";

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
    <section className="fengz-carbon-panel fengz-rgb-edge repair-premium-card rounded-3xl border border-white/10 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            <FileText className="size-3.5" />
            Cotizacion
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-50">{quote.invoiceNumber}</h2>
        </div>
        <RepairBadge tone={quote.status === "APPROVED" ? "cyan" : "violet"}>
          {quoteStatusLabel(quote.status)}
        </RepairBadge>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="hidden w-full min-w-[680px] border-collapse text-left text-sm md:table">
            <thead className="bg-zinc-950/95 text-zinc-300">
              <tr>
                <TableHeader>
                  <span className="inline-flex items-center gap-1">
                    <PackageSearch className="size-3.5" />
                    Tipo
                  </span>
                </TableHeader>
                <TableHeader>Descripcion</TableHeader>
                <TableHeader>Cantidad</TableHeader>
                <TableHeader>Unitario</TableHeader>
                <TableHeader>
                  <span className="inline-flex items-center gap-1">
                    <ReceiptText className="size-3.5" />
                    Total
                  </span>
                </TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {quote.items.map((item, index) => (
                <tr key={`${item.description}-${index}`} className="repair-table-row text-zinc-200">
                  <td className="px-4 py-3">{itemTypeLabel(item.itemType)}</td>
                  <td className="px-4 py-3 break-words font-semibold">{item.description}</td>
                  <td className="px-4 py-3">{String(item.quantity)}</td>
                  <td className="px-4 py-3">
                    {formatMoney(quote.currency, moneyValue(item.unitPrice))}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {formatMoney(quote.currency, moneyValue(item.lineTotal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid gap-3 p-3 md:hidden">
            {quote.items.map((item, index) => (
              <div key={`${item.description}-${index}`} className="repair-premium-card repair-rgb-card rounded-2xl border border-white/10 bg-zinc-950/80 p-3 text-sm">
                <p className="font-bold text-zinc-50">{item.description}</p>
                <p className="text-zinc-400">
                  {itemTypeLabel(item.itemType)} · Cantidad {String(item.quantity)}
                </p>
                <p className="text-zinc-300">
                  Unitario: {formatMoney(quote.currency, moneyValue(item.unitPrice))}
                </p>
                <p className="font-black text-zinc-50">
                  Total: {formatMoney(quote.currency, moneyValue(item.lineTotal))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
          {quote.customerNotes
            ? quote.customerNotes
            : "Precios sujetos a disponibilidad y validacion final del taller."}
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
          Descargar PDF de cotizacion
        </RepairButton>
        <span className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-300">
          Si necesitas aprobar o ajustar esta cotizacion, contacta directamente a FengzLab.
        </span>
      </div>
    </section>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
      {children}
    </th>
  );
}

function Totals({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-wrap justify-between gap-3 border-b border-white/10 py-2 last:border-0"
        >
          <dt className="text-zinc-400">{label}</dt>
          <dd className="font-black text-zinc-50">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function moneyValue(value: unknown) {
  return value as { toString(): string } | number | string;
}
