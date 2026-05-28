import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNav } from "@/components/admin-nav";
import {
  RepairBadge,
  RepairContainer,
  RepairFloatingPanel,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairPanel,
} from "@/components/repairlab";
import {
  channelLabel,
  messageStatusLabel,
  providerLabel,
  templateLabel,
} from "@/modules/messages/message-labels";
import { getMessageDetailData } from "@/modules/messages/message-detail.service";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  await requireLocalStaff();
  const { messageId } = await params;
  const message = await getMessageDetailData(messageId);

  if (!message) {
    notFound();
  }

  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Mensaje"
        title={message.subject ?? "Sin asunto"}
        description="Detalle seguro del mensaje transaccional. El HTML se muestra como texto para evitar ejecutar contenido dentro del admin."
        actions={
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-zinc-900/45 px-5 py-2.5 text-sm font-black text-white transition hover:bg-zinc-800/70" href="/admin/messages">
            Volver a mensajes
          </Link>
        }
      />

      <RepairContainer className="space-y-6 py-8">
        <RepairGrid className="sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Destinatario" value={message.recipient ?? "Sin destinatario"} />
          <Info label="Estado" value={messageStatusLabel(message.status, message.provider)} />
          <Info label="Proveedor" value={providerLabel(message.provider)} />
          <Info label="Canal" value={channelLabel(message.channel)} />
          <Info label="Tipo" value={templateLabel(message.metadata.template)} />
          <Info label="Fecha" value={message.createdAt.toLocaleString("es-CR")} />
          <Info label="Enviado" value={message.sentAt?.toLocaleString("es-CR") ?? "No enviado"} />
          <Info label="Cliente" value={message.customer?.name ?? "No asociado"} />
          <Info
            label="Ticket"
            value={message.ticket?.ticketNumber ?? "No asociado"}
            href={message.ticket ? `/admin/tickets/${message.ticket.id}` : undefined}
          />
        </RepairGrid>

        {message.metadata.error || message.metadata.reason ? (
          <RepairFloatingPanel className="border-amber-300/20 bg-amber-500/10 shadow-amber-950/10">
            <h2 className="font-black text-zinc-950 dark:text-zinc-50">Estado del envio</h2>
            <p className="mt-2 break-words text-sm font-semibold text-amber-100">
              {message.metadata.error ?? message.metadata.reason}
            </p>
          </RepairFloatingPanel>
        ) : null}

        {message.metadata.portalUrl ? (
          <RepairFloatingPanel className="border-emerald-300/20 bg-emerald-500/10 shadow-emerald-950/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-black text-zinc-950 dark:text-zinc-50">Portal cliente</h2>
              <RepairBadge tone="emerald">Disponible</RepairBadge>
            </div>
            <a className="mt-3 block break-all text-sm font-semibold text-emerald-100 underline" href={message.metadata.portalUrl} target="_blank" rel="noreferrer">
              {message.metadata.portalUrl}
            </a>
          </RepairFloatingPanel>
        ) : null}

        <ContentPanel title="Texto" content={message.body ?? "Sin contenido de texto."} />
        <ContentPanel
          title="HTML preview"
          description="Se muestra como texto para evitar ejecutar contenido HTML dentro del admin."
          content={message.metadata.htmlPreview ?? "No hay HTML preview guardado para este mensaje."}
          compact
        />
      </RepairContainer>
    </RepairPageShell>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <RepairPanel>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      {href ? (
        <Link className="mt-1 block break-words text-sm font-black text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50" href={href}>
          {value}
        </Link>
      ) : (
        <p className="mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{value}</p>
      )}
    </RepairPanel>
  );
}

function ContentPanel({
  title,
  description,
  content,
  compact = false,
}: {
  title: string;
  description?: string;
  content: string;
  compact?: boolean;
}) {
  return (
    <RepairPanel className="space-y-3">
      <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
      {description ? <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      <pre className={`${compact ? "max-h-[520px] text-xs" : "text-sm"} overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-zinc-950 p-4 text-zinc-100`}>
        {content}
      </pre>
    </RepairPanel>
  );
}
