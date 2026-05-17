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
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500">Admin / Recepcion</p>
        <h1 className="text-2xl font-semibold text-zinc-950">Recepcion de equipos</h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          Registra cliente, equipo, condicion inicial y problema reportado. El sistema crea
          automaticamente ticket, historial de estado y auditoria minima.
        </p>
      </header>

      <IntakeForm />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-950">Recepciones recientes</h2>
        <div className="overflow-x-auto rounded border border-zinc-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2">Ticket</th>
                <th className="border-b border-zinc-200 px-3 py-2">Cliente</th>
                <th className="border-b border-zinc-200 px-3 py-2">Equipo</th>
                <th className="border-b border-zinc-200 px-3 py-2">Estado</th>
                <th className="border-b border-zinc-200 px-3 py-2">Fotos</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-zinc-500" colSpan={5}>
                    Aun no hay recepciones registradas.
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-3 py-2 font-medium">{ticket.ticketNumber}</td>
                    <td className="px-3 py-2">
                      {ticket.customer.firstName} {ticket.customer.lastName ?? ""}
                    </td>
                    <td className="px-3 py-2">
                      {ticket.device.brand} {ticket.device.model ?? ""}
                    </td>
                    <td className="px-3 py-2">{ticket.status}</td>
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

