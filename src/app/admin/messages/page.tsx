import Link from "next/link";
import { MessageStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import { MessageLogCard } from "@/components/repairlab/message-log-card";
import { MessagesHero } from "@/components/repairlab/messages-hero";
import {
  RepairButton,
  RepairContainer,
  RepairEmptyState,
  RepairGrid,
  RepairPageShell,
  RepairSearchBar,
} from "@/components/repairlab";
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
  const hasActiveFilters = Boolean(filters.search || filters.status || filters.provider || filters.template || filters.recent);

  return (
    <RepairPageShell>
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
              <option value="quote.sent">Cotización lista</option>
              <option value="quote.approved">Cotización aprobada</option>
              <option value="ticket.ready_for_pickup">Equipo listo</option>
              <option value="ticket.delivered">Ticket cerrado</option>
              <option value="ticket.status_changed">Cambio de estado</option>
            </select>
            <select name="recent" defaultValue={filters.recent} className={fieldClassName}>
              <option value="">Todas las fechas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
            <div className="grid gap-2 sm:flex">
              <button className="min-h-12 rounded-full border border-cyan-300/45 bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 hover:shadow-cyan-300/25">
                Filtrar
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-zinc-800 px-5 py-3 text-sm font-black text-zinc-100 transition hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white"
                href="/admin/messages"
              >
                Limpiar
              </Link>
            </div>
          </form>
        </RepairSearchBar>

        {messages.length === 0 ? (
          <RepairEmptyState
            title="No hay mensajes para mostrar."
            description="Cuando se creen tickets, se envíen cotizaciones o cambien estados importantes, los mensajes transaccionales quedarán registrados aquí."
            eyebrow={hasActiveFilters ? "Filtro sin resultados" : "Centro de mensajes vacío"}
            icon="MS"
            action={hasActiveFilters ? <RepairButton href="/admin/messages">Limpiar filtros</RepairButton> : <RepairButton href="/admin/tickets">Ver tickets</RepairButton>}
            secondaryAction={hasActiveFilters ? <RepairButton href="/admin/tickets" tone="secondary">Ver tickets</RepairButton> : null}
          />
        ) : (
          <RepairGrid>
            {messages.map((message) => (
              <MessageLogCard key={message.id} message={message} />
            ))}
          </RepairGrid>
        )}
      </RepairContainer>
    </RepairPageShell>
  );
}

const fieldClassName = "repair-input-surface text-sm";
