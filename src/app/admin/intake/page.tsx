import Link from "next/link";
import type { TicketStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import { IntakeForm } from "@/modules/intake/components/intake-form";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminIntakePage() {
  const recentTickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      customer: true,
      device: true,
      intake: {
        include: {
          files: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <AdminNav />
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Admin / Recepcion</p>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50 sm:text-3xl">Recepcion de equipos</h1>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
          Registra aqui un equipo que ingresa al taller. El sistema crea automaticamente el ticket y su historial.
        </p>
      </header>

      <IntakeForm />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Recepciones recientes</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-zinc-950/95 text-zinc-300">
              <tr>
                <th className="border-b border-white/10 px-3 py-2">Ticket</th>
                <th className="border-b border-white/10 px-3 py-2">Cliente</th>
                <th className="border-b border-white/10 px-3 py-2">Equipo</th>
                <th className="border-b border-white/10 px-3 py-2">Estado</th>
                <th className="border-b border-white/10 px-3 py-2">Fotos</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-zinc-500 dark:text-zinc-400" colSpan={5}>
                    Aun no hay recepciones registradas.
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="repair-table-row">
                    <td className="px-3 py-2 font-medium">
                      <Link className="underline dark:text-zinc-100" href={`/admin/tickets/${ticket.id}`}>
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-2 break-words">
                      {ticket.customer.firstName} {ticket.customer.lastName ?? ""}
                    </td>
                    <td className="px-3 py-2 break-words">
                      {ticket.device.brand} {ticket.device.model ?? ""}
                    </td>
                    <td className="px-3 py-2">{ticketStatusLabel(ticket.status)}</td>
                    <td className="px-3 py-2">{ticket.intake?.files.length ?? 0}</td>
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

function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revision inicial",
    DIAGNOSIS: "En diagnostico",
    WAITING_APPROVAL: "Esperando aprobacion",
    APPROVED: "Listo para reparacion",
    REPAIR_IN_PROGRESS: "En reparacion",
    READY_FOR_PICKUP: "Listo para entrega",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}
