import Link from "next/link";
import type { MessageStatus } from "@prisma/client";

import {
  messageStatusLabel,
  messageStatusTone,
  providerLabel,
  templateLabel,
} from "@/modules/messages/message-labels";

import { RepairBadge, RepairInlineAlert } from "./index";

export type MessageLogCardData = {
  id: string;
  createdAt: Date;
  recipient: string | null;
  subject: string | null;
  provider: string | null;
  status: MessageStatus;
  template: string | null | undefined;
  error: string | null | undefined;
  reason: string | null | undefined;
  customerName: string | null;
  ticket: { id: string; ticketNumber: string } | null;
};

export function MessageLogCard({ message }: { message: MessageLogCardData }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-sm shadow-black/30 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:shadow-2xl hover:shadow-cyan-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={message.status} provider={message.provider} />
            <RepairBadge tone="cyan">{providerLabel(message.provider)}</RepairBadge>
          </div>
          <Link
            className="mt-3 block break-words text-xl font-black text-zinc-950 transition hover:text-emerald-600 dark:text-zinc-50 dark:hover:text-emerald-300"
            href={`/admin/messages/${message.id}`}
          >
            {message.subject ?? "Sin asunto"}
          </Link>
          <p className="mt-2 break-words text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {message.recipient ?? "Sin destinatario"} / {message.createdAt.toLocaleString("es-CR")}
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-zinc-800 px-4 py-2 text-xs font-black text-zinc-100 transition hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white"
          href={`/admin/messages/${message.id}`}
        >
          Ver detalle
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Tipo" value={templateLabel(message.template)} />
        <Info label="Cliente" value={message.customerName ?? "No asociado"} />
        <Info
          label="Ticket"
          value={message.ticket?.ticketNumber ?? "No asociado"}
          href={message.ticket ? `/admin/tickets/${message.ticket.id}` : undefined}
        />
        <Info label="Provider" value={providerLabel(message.provider)} />
      </div>

      {message.error || message.reason ? (
        <div className="mt-4">
          <RepairInlineAlert tone="warning" title="Revisar envío" compact>
            <p>{message.error ?? message.reason}</p>
          </RepairInlineAlert>
        </div>
      ) : null}
    </article>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/75 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      {href ? (
        <Link className="mt-1 block break-words text-sm font-black text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50" href={href}>
          {value}
        </Link>
      ) : (
        <p className="mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{value}</p>
      )}
    </div>
  );
}

function StatusBadge({ status, provider }: { status: MessageStatus; provider?: string | null }) {
  const tone = messageStatusTone(status, provider);
  const badgeTone = tone === "success" ? "emerald" : tone === "danger" ? "danger" : tone === "info" ? "cyan" : "neutral";

  return <RepairBadge tone={badgeTone}>{messageStatusLabel(status, provider)}</RepairBadge>;
}
