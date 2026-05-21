import Link from "next/link";
import { MessageStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import { MessageLogCard } from "@/components/repairlab/message-log-card";
import { MessagesHero } from "@/components/repairlab/messages-hero";
import { RepairContainer, RepairEmptyState, RepairSearchBar } from "@/components/repairlab";
import { messageStatusLabel } from "@/modules/messages/message-labels";
import {
  getMessageListData,
  type MessageListSearchParams,
} from "@/modules/messages/message-list.service";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

const statusOptions = Object.values(MessageStatus);

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<MessageListSearchParams>;
}) {
  await requireLocalStaff();
  const params = await searchParams;
  const { filters, messages } = await getMessageListData(params);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AdminNav />
      <MessagesHero messages={messages} />

      <RepairContainer className="space-y-6 py-8">
        <RepairSearchBar>
          <form className="grid gap-3 xl:grid-cols-[1fr_170px_170px_190px_150px_auto]">
            <input
              name="search"
              defaultValue={filters.search}
              placeholder="Buscar destinatario, asunto, ticket o cliente"
              className={fieldClassName}
            />
            <select name="status" defaultValue={filters.status} className={fieldClassName}>
              <option value="">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {messageStatusLabel(status)}
                </option>
              ))}
            </select>
            <select name="provider" defaultValue={filters.provider} className={fieldClassName}>
              <option value="">Todos los proveedores</option>
              <option value="console">Vista previa</option>
              <option value="resend">Resend</option>
              <option value="disabled">Deshabilitado</option>
            </select>
            <select name="template" defaultValue={filters.template} className={fieldClassName}>
              <option value="">Todos los tipos</option>
              <option value="intake.received">Ticket recibido</option>
              <option value="quote.sent">Cotizacion lista</option>
              <option value="quote.approved">Cotizacion aprobada</option>
              <option value="ticket.ready_for_pickup">Equipo listo</option>
              <option value="ticket.delivered">Ticket cerrado</option>
              <option value="ticket.status_changed">Cambio de estado</option>
            </select>
            <select name="recent" defaultValue={filters.recent} className={fieldClassName}>
              <option value="">Todas las fechas</option>
              <option value="7d">Ultimos 7 dias</option>
              <option value="30d">Ultimos 30 dias</option>
            </select>
            <div className="grid gap-2 sm:flex">
              <button className="min-h-12 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600">
                Filtrar
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-black text-zinc-900 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                href="/admin/messages"
              >
                Limpiar
              </Link>
            </div>
          </form>
        </RepairSearchBar>

        {messages.length === 0 ? (
          <RepairEmptyState
            title="No hay mensajes registrados."
            description="Cuando se creen tickets o se envien cotizaciones, apareceran aqui."
          />
        ) : (
          <section className="grid gap-4">
            {messages.map((message) => (
              <MessageLogCard key={message.id} message={message} />
            ))}
          </section>
        )}
      </RepairContainer>
    </main>
  );
}

const fieldClassName =
  "min-h-12 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 placeholder:text-zinc-500 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-emerald-900";
