import Link from "next/link";

import { AdminNav, DemoChecklist } from "@/components/admin-nav";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireLocalStaff();

  const [ticketCount, openTicketCount, recentTickets] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({
      where: {
        status: {
          notIn: ["DELIVERED", "CANCELLED"],
        },
      },
    }),
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: true,
        device: true,
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <AdminNav />

      <header className="space-y-3">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Admin / Inicio</p>
        <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
          Repair Lab System
        </h1>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
          Sistema interno para gestion de reparaciones, cotizaciones, facturas, pagos e inventario.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <HomeCard href="/admin/dashboard" title="Dashboard" description="Resumen operativo del taller." />
        <HomeCard href="/admin/intake" title="Nueva recepcion" description="Registra un equipo que ingresa al taller." />
        <HomeCard href="/admin/tickets" title="Tickets" description="Consulta y da seguimiento a reparaciones." />
        <HomeCard href="/admin/catalog" title="Catalogo" description="Administra servicios, repuestos e inventario." />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Resumen rapido</h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <SummaryRow label="Tickets totales" value={ticketCount} />
            <SummaryRow label="Tickets abiertos" value={openTicketCount} />
          </dl>
        </div>

        <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Ultimos tickets</h2>
          {recentTickets.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No hay tickets todavia.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {recentTickets.map((ticket) => (
                <li key={ticket.id} className="flex flex-wrap justify-between gap-3 rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <div>
                    <Link className="font-medium underline" href={`/admin/tickets/${ticket.id}`}>
                      {ticket.ticketNumber}
                    </Link>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {ticket.customer.firstName} {ticket.customer.lastName ?? ""} / {ticket.device.brand} {ticket.device.model ?? ""}
                    </p>
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {ticket.createdAt.toLocaleDateString("es-CR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <DemoChecklist />
    </main>
  );
}

function HomeCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      className="rounded border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
      href={href}
    >
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
    </Link>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium text-zinc-950 dark:text-zinc-50">{value}</dd>
    </div>
  );
}
