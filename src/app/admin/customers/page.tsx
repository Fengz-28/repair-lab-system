import Link from "next/link";

import { AdminNav } from "@/components/admin-nav";
import { CustomerCRMStats } from "@/components/repairlab/crm-stats-grid";
import { RepairButton, RepairContainer, RepairEmptyState, RepairPageHero, RepairSearchBar } from "@/components/repairlab";
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
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
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
                className="mt-2 min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-emerald-900"
              />
            </div>
            <div className="grid gap-2 sm:flex sm:items-end lg:pt-7">
              <button className="min-h-12 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600">
                Buscar
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-black text-zinc-900 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                href="/admin/customers"
              >
                Limpiar
              </Link>
            </div>
          </form>
          {search ? (
            <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
              Filtro activo: {search}
            </div>
          ) : null}
        </RepairSearchBar>

        {customers.length === 0 ? (
          <RepairEmptyState
            title={search ? "No se encontraron clientes." : "No hay clientes registrados todavia."}
            description={search ? "Prueba cambiar la busqueda." : "Crea una recepcion para registrar el primer cliente."}
            action={!search ? <RepairButton href="/admin/intake">Crear recepcion</RepairButton> : null}
          />
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            {customers.map((customer) => (
              <CustomerSummaryCard key={customer.id} customer={customer} />
            ))}
          </section>
        )}
      </RepairContainer>
    </main>
  );
}
