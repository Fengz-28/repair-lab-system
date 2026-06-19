import Link from "next/link";

import { AdminNav, DemoChecklist } from "@/components/admin-nav";
import {
  RepairButton,
  RepairCard,
  RepairContainer,
  RepairPageHero,
  RepairPanel,
  RepairSection,
  RepairStatCard,
} from "@/components/repairlab";
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
    <main className="min-h-screen bg-black text-zinc-50">
      <AdminNav />

      <RepairPageHero
        eyebrow="Admin / Inicio"
        title="Sistema interno FengzLab"
        description="Panel operativo para gestionar reparaciones, clientes, cotizaciones, facturas, pagos e inventario con una experiencia moderna de taller técnico."
        actions={
          <>
            <RepairButton href="/admin/intake">Nueva recepción</RepairButton>
            <RepairButton href="/admin/dashboard" tone="secondary">Ver panel</RepairButton>
          </>
        }
      />

      <RepairContainer className="space-y-8 py-8 sm:py-10">
        <RepairSection>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <HomeCard href="/admin/dashboard" title="Panel" description="Resumen operativo del taller." />
            <HomeCard href="/admin/intake" title="Nueva recepción" description="Registra un equipo que ingresa al taller." />
            <HomeCard href="/admin/tickets" title="Tickets" description="Seguimiento de reparaciones." />
            <HomeCard href="/admin/customers" title="Clientes" description="Historial, equipos y saldos." />
            <HomeCard href="/admin/messages" title="Mensajes" description="Audita emails y notificaciones." />
            <HomeCard href="/admin/catalog" title="Catálogo" description="Servicios, repuestos e inventario." />
          </div>
        </RepairSection>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <RepairStatCard label="Tickets totales" value={ticketCount} tone="emerald" />
            <RepairStatCard label="Tickets abiertos" value={openTicketCount} tone="cyan" />
          </div>

          <RepairPanel>
            <h2 className="text-base font-black text-zinc-950 dark:text-zinc-50">Últimos tickets</h2>
            {recentTickets.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No hay tickets todavía.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {recentTickets.map((ticket) => (
                  <li key={ticket.id} className="flex flex-wrap justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
                    <div className="min-w-0">
                      <Link className="font-bold text-zinc-950 underline decoration-cyan-400 underline-offset-4 dark:text-zinc-50" href={`/admin/tickets/${ticket.id}`}>
                        {ticket.ticketNumber}
                      </Link>
                      <p className="break-words text-zinc-500 dark:text-zinc-400">
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
          </RepairPanel>
        </section>

        <DemoChecklist />
      </RepairContainer>
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
    <Link href={href}>
      <RepairCard className="min-h-36">
        <div className="grid size-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-500/10 text-sm font-black text-cyan-100">
          RL
        </div>
        <h2 className="mt-4 text-base font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      </RepairCard>
    </Link>
  );
}


