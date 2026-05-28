import Link from "next/link";

import { AdminNav } from "@/components/admin-nav";
import { CustomerCRMStats } from "@/components/repairlab/crm-stats-grid";
import {
  RepairButton,
  RepairContainer,
  RepairEmptyState,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSearchBar,
} from "@/components/repairlab";
import { CustomerSummaryCard } from "@/components/repairlab/customer-summary-card";
import {
  getCustomerListData,
  type CustomerListSearchParams,
} from "@/modules/customers/customer-list.service";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<CustomerListSearchParams>;
}) {
  await requireLocalStaff();
  const params = await searchParams;
  const { customers, search } = await getCustomerListData(params);

  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / CRM"
        title="Clientes"
        description="Customer intelligence para revisar historial tecnico, equipos, tickets, facturas, pagos y saldos pendientes desde una vista operativa."
        actions={
          <>
            <RepairButton href="/admin/intake">Nueva recepcion</RepairButton>
            <RepairButton href="/admin/tickets" tone="secondary">
              Ver tickets
            </RepairButton>
          </>
        }
      />

      <RepairContainer className="space-y-6 py-8">
        <CustomerCRMStats customers={customers} />

        <RepairSearchBar>
          <form className="grid gap-3 lg:flex lg:items-center">
            <div className="min-w-0 flex-1">
              <label className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400" htmlFor="customer-search">
                Buscar cliente
              </label>
              <input
                id="customer-search"
                name="search"
                defaultValue={search}
                placeholder="Cliente, telefono, email, equipo o ticket"
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-500 shadow-sm shadow-black/20 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div className="grid gap-2 sm:flex sm:items-end lg:pt-7">
              <button className="min-h-12 rounded-full border border-emerald-300/40 bg-emerald-500 px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 hover:shadow-cyan-400/20">
                Buscar
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-zinc-800 px-5 py-3 text-sm font-black text-zinc-100 transition hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white"
                href="/admin/customers"
              >
                Limpiar
              </Link>
            </div>
          </form>
          {search ? (
            <div className="mt-4 inline-flex rounded-full border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-100">
              Filtro activo: {search}
            </div>
          ) : null}
        </RepairSearchBar>

        {customers.length === 0 ? (
          <RepairEmptyState
            title={search ? "No encontramos clientes." : "No hay clientes registrados todavia."}
            description={
              search
                ? "Prueba con otro nombre, telefono, email, equipo o codigo de ticket."
                : "Cada recepcion crea o reutiliza el cliente para que puedas ver historial, equipos y saldos desde el CRM."
            }
            eyebrow={search ? "Busqueda sin resultados" : "CRM vacio"}
            icon={search ? "BC" : "CL"}
            action={!search ? <RepairButton href="/admin/intake">Crear recepcion</RepairButton> : <RepairButton href="/admin/customers">Limpiar busqueda</RepairButton>}
            secondaryAction={!search ? <RepairButton href="/admin/tickets" tone="secondary">Ver tickets</RepairButton> : null}
          />
        ) : (
          <RepairGrid className="gap-5 xl:grid-cols-2">
            {customers.map((customer) => (
              <CustomerSummaryCard key={customer.id} customer={customer} />
            ))}
          </RepairGrid>
        )}
      </RepairContainer>
    </RepairPageShell>
  );
}
