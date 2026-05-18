import Link from "next/link";

import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  await requireLocalStaff();

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      device: true,
      invoices: {
        where: {
          type: "QUOTE",
        },
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Admin / Tickets
        </p>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Tickets de reparacion
        </h1>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
          Vista operativa para abrir tickets y cotizaciones sin buscar IDs internos.
        </p>
      </header>

      <section className="overflow-hidden rounded border border-zinc-200 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Ticket
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Cliente
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Contacto
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Equipo
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Problema
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Estado
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Creado
                </th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-zinc-500 dark:text-zinc-400" colSpan={8}>
                    Aun no hay tickets registrados.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-3 py-3 font-medium text-zinc-950 dark:text-zinc-50">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-3 py-3 text-zinc-800 dark:text-zinc-200">
                      {ticket.customer.firstName} {ticket.customer.lastName ?? ""}
                    </td>
                    <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">
                      {ticket.customer.whatsappPhone ??
                        ticket.customer.phone ??
                        ticket.customer.email ??
                        "Sin contacto"}
                    </td>
                    <td className="px-3 py-3 text-zinc-800 dark:text-zinc-200">
                      {ticket.device.brand} {ticket.device.model ?? ""}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-zinc-600 dark:text-zinc-300">
                      <span className="line-clamp-2">{ticket.reportedIssue}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">
                      {ticket.createdAt.toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="rounded bg-zinc-950 px-3 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
                          href={`/admin/tickets/${ticket.id}`}
                        >
                          Abrir
                        </Link>
                        <Link
                          className="rounded border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                          href={`/admin/tickets/${ticket.id}/quotes`}
                        >
                          Cotizaciones ({ticket.invoices.length})
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

