import Link from "next/link";

import { formatMoney } from "@/modules/customers/customer-labels";

import { RepairBadge, RepairButton, RepairContainer, RepairFloatingPanel } from "./index";

export function CustomerHero({
  name,
  contact,
  phone,
  email,
  ticketCount,
  invoiceCount,
  totalInvoiced,
  totalPaid,
  balanceDue,
}: {
  name: string;
  contact: string;
  phone: string | null;
  email: string | null;
  ticketCount: number;
  invoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
}) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.15),rgba(0,0,0,0.86))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_47%,rgba(255,255,255,0.08)_48%,transparent_50%)] [background-size:46px_46px]" />
      <RepairContainer className="relative py-12 sm:py-16">
        <Link className="text-sm font-bold text-emerald-200 transition hover:text-white" href="/admin/customers">
          Volver a clientes
        </Link>
        <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">CRM / Cliente</p>
            <h1 className="mt-3 break-words text-4xl font-black tracking-tight sm:text-5xl">{name}</h1>
            <p className="mt-3 break-words text-sm leading-6 text-zinc-300 sm:text-base">{contact}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <RepairBadge tone="emerald">{ticketCount} tickets</RepairBadge>
              <RepairBadge tone="cyan">{invoiceCount} facturas</RepairBadge>
              <RepairBadge tone={balanceDue > 0 ? "warning" : "emerald"}>
                Saldo {formatMoney(balanceDue)}
              </RepairBadge>
            </div>
          </div>
          <RepairFloatingPanel className="w-full bg-zinc-900/45 lg:max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Resumen financiero</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <HeroMetric label="Facturado" value={formatMoney(totalInvoiced)} />
              <HeroMetric label="Pagado" value={formatMoney(totalPaid)} />
            </div>
            <div className="mt-4 grid gap-2">
              <p className="text-sm text-zinc-300">Telefono: {phone ?? "No registrado"}</p>
              <p className="break-words text-sm text-zinc-300">Email: {email ?? "No registrado"}</p>
            </div>
            <div className="mt-5">
              <RepairButton href={`/admin/tickets?search=${encodeURIComponent(name)}`} tone="primary">
                Ver tickets del cliente
              </RepairButton>
            </div>
          </RepairFloatingPanel>
        </div>
      </RepairContainer>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/45 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-white">{value}</p>
    </div>
  );
}
