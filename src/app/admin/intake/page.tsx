import Link from "next/link";
import type { TicketStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairPageHero,
  RepairPageShell,
  RepairSurface,
  RepairTable,
} from "@/components/repairlab";
import { IntakeForm } from "@/modules/intake/components/intake-form";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminIntakePage() {
  await requireLocalStaff();

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
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Recepción"
        title="Recepción de equipos"
        description="Registra aquí cada equipo que ingresa al taller. El sistema crea automáticamente el ticket y su historial de trabajo."
      />

      <RepairContainer className="space-y-6 py-8 sm:space-y-8 sm:py-10">
        <RepairSurface>
          <IntakeForm />
        </RepairSurface>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-50">Recepciones recientes</h2>
          <RepairTable>
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-zinc-950/95 text-zinc-300">
                <tr>
                  <th className="border-b border-white/10 px-3 py-2">Ticket</th>
                  <th className="border-b border-white/10 px-3 py-2">Cliente</th>
                  <th className="border-b border-white/10 px-3 py-2">Equipo</th>
                  <th className="border-b border-white/10 px-3 py-2">Estado</th>
                  <th className="border-b border-white/10 px-3 py-2">Archivos</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-zinc-500 dark:text-zinc-400" colSpan={5}>
                      Aún no hay recepciones registradas.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="repair-table-row">
                      <td className="px-3 py-2 font-medium">
                        <Link className="underline decoration-cyan-400 underline-offset-4 dark:text-zinc-100" href={`/admin/tickets/${ticket.id}`}>
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
          </RepairTable>
        </section>
      </RepairContainer>
    </RepairPageShell>
  );
}

function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revisión inicial",
    DIAGNOSIS: "En diagnóstico",
    WAITING_APPROVAL: "Esperando aprobación",
    APPROVED: "Listo para reparación",
    REPAIR_IN_PROGRESS: "En reparación",
    READY_FOR_PICKUP: "Listo para entrega",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}
