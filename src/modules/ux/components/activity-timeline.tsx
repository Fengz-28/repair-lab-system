import type React from "react";

import { RepairBadge, RepairEmptyState, RepairPanel } from "@/components/repairlab";

export type ActivityTimelineItemTone = "emerald" | "cyan" | "warning" | "danger" | "violet" | "neutral";

export type ActivityTimelineItemData = {
  id: string;
  title: string;
  description?: string;
  timestamp?: Date | string | null;
  tone?: ActivityTimelineItemTone;
  meta?: string;
};

export function ActivityTimeline({
  children,
  emptyDescription = "Todavía no hay actividad suficiente para construir esta línea de tiempo.",
  emptyTitle = "Sin actividad registrada",
  items,
  subtitle,
  title = "Línea de tiempo",
}: {
  children?: React.ReactNode;
  emptyDescription?: string;
  emptyTitle?: string;
  items: ActivityTimelineItemData[];
  subtitle?: string;
  title?: string;
}) {
  return (
    <RepairPanel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            Actividad
          </p>
          <h2 className="mt-1 text-lg font-black text-zinc-50">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p> : null}
        </div>
        <RepairBadge tone={items.length ? "cyan" : "neutral"}>
          {items.length} eventos
        </RepairBadge>
      </div>

      {items.length ? (
        <ol className="mt-6 space-y-4">
          {items.map((item) => (
            <ActivityTimelineItem key={item.id} item={item} />
          ))}
        </ol>
      ) : (
        <div className="mt-6">
          <EmptyTimelineState title={emptyTitle} description={emptyDescription} />
        </div>
      )}

      {children ? <div className="mt-5">{children}</div> : null}
    </RepairPanel>
  );
}

export function ActivityTimelineItem({ item }: { item: ActivityTimelineItemData }) {
  const tone = item.tone ?? "neutral";

  return (
    <li className="group relative pl-8">
      <span className="absolute left-[9px] top-6 h-[calc(100%+1rem)] w-px bg-white/10 group-last:hidden" />
      <span className={`absolute left-0 top-2 size-5 rounded-full border-4 border-zinc-950 shadow-lg ${dotClass(tone)}`} />
      <div className="repair-card-motion rounded-2xl border border-white/10 bg-zinc-950/75 p-4 shadow-sm shadow-black/25 transition hover:border-cyan-300/30 hover:bg-zinc-900/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-sm font-black text-zinc-50">{item.title}</p>
            {item.description ? (
              <p className="mt-2 break-words text-sm leading-6 text-zinc-400">{item.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
            {item.meta ? <RepairBadge tone={badgeTone(tone)}>{item.meta}</RepairBadge> : null}
            {item.timestamp ? (
              <time className="text-xs font-medium text-zinc-500">
                {formatActivityTime(item.timestamp)}
              </time>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export function EmptyTimelineState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <RepairEmptyState
      compact
      eyebrow="Línea de tiempo"
      title={title}
      description={description}
      icon="TL"
    />
  );
}

function dotClass(tone: ActivityTimelineItemTone) {
  const classes: Record<ActivityTimelineItemTone, string> = {
    emerald: "border-emerald-400 bg-emerald-400 shadow-emerald-500/25",
    cyan: "border-cyan-400 bg-cyan-400 shadow-cyan-500/25",
    warning: "border-amber-400 bg-amber-400 shadow-amber-500/25",
    danger: "border-red-400 bg-red-400 shadow-red-500/25",
    violet: "border-violet-400 bg-violet-400 shadow-violet-500/25",
    neutral: "border-zinc-500 bg-zinc-500 shadow-zinc-500/20",
  };

  return classes[tone];
}

function badgeTone(tone: ActivityTimelineItemTone) {
  const tones: Record<ActivityTimelineItemTone, "neutral" | "emerald" | "cyan" | "warning" | "danger" | "violet"> = {
    emerald: "emerald",
    cyan: "cyan",
    warning: "warning",
    danger: "danger",
    violet: "violet",
    neutral: "neutral",
  };

  return tones[tone];
}

function formatActivityTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleString("es-CR");
}
