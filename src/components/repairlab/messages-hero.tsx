import type { MessageStatus } from "@prisma/client";

import { RepairBadge, RepairButton, RepairContainer } from "./index";

type MessageHeroItem = {
  status: MessageStatus;
  provider: string | null;
  createdAt: Date;
};

export function MessagesHero({ messages }: { messages: MessageHeroItem[] }) {
  const failed = messages.filter((message) => message.status === "FAILED").length;
  const sent = messages.filter((message) => message.status === "SENT").length;
  const providers = new Set(messages.map((message) => message.provider).filter(Boolean)).size;
  const latestTime = messages[0]?.createdAt.getTime() ?? 0;
  const recent = messages.filter((message) => {
    const diff = latestTime - message.createdAt.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.15),rgba(0,0,0,0.86))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_47%,rgba(255,255,255,0.08)_48%,transparent_50%)] [background-size:46px_46px]" />
      <RepairContainer className="relative py-12 sm:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Admin / Comunicaciones</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Mensajes</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Centro de actividad para emails transaccionales, previews, estados de envio y errores operativos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RepairBadge tone="emerald">{messages.length} mensajes</RepairBadge>
              <RepairBadge tone="cyan">{sent} enviados</RepairBadge>
              <RepairBadge tone={failed > 0 ? "danger" : "emerald"}>{failed} fallidos</RepairBadge>
            </div>
          </div>
          <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur lg:max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Pulso de notificaciones</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <HeroMetric label="Ultimos 7 dias" value={String(recent)} />
              <HeroMetric label="Providers" value={String(providers)} />
            </div>
            <div className="mt-5">
              <RepairButton href="/admin/tickets" tone="primary">Ver tickets</RepairButton>
            </div>
          </div>
        </div>
      </RepairContainer>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-white">{value}</p>
    </div>
  );
}
