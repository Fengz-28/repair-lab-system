import type React from "react";

import { RepairPanel } from "@/components/repairlab";

export type RepairTimelineItem = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  tone?: "emerald" | "cyan" | "warning" | "violet" | "neutral";
};

export function RepairTicketTimeline({ items }: { items: RepairTimelineItem[] }) {
  return (
    <RepairPanel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Workflow</p>
          <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-zinc-50">Timeline del ticket</h2>
        </div>
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-500 dark:border-zinc-800">
          {items.length} eventos
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No hay eventos registrados.</p>
      ) : (
        <ol className="mt-6 space-y-4">
          {items.map((item) => (
            <RepairTimelineItem key={item.id} item={item} />
          ))}
        </ol>
      )}
    </RepairPanel>
  );
}

export function RepairTimelineItem({ item }: { item: RepairTimelineItem }) {
  const tone = {
    emerald: "border-emerald-500 bg-emerald-500 shadow-emerald-500/30",
    cyan: "border-cyan-500 bg-cyan-500 shadow-cyan-500/30",
    warning: "border-amber-500 bg-amber-500 shadow-amber-500/30",
    violet: "border-violet-500 bg-violet-500 shadow-violet-500/30",
    neutral: "border-zinc-400 bg-zinc-400 shadow-zinc-500/20",
  }[item.tone ?? "neutral"];

  return (
    <li className="group relative pl-8">
      <span className="absolute left-[9px] top-6 h-[calc(100%+1rem)] w-px bg-zinc-200 group-last:hidden dark:bg-zinc-800" />
      <span className={`absolute left-0 top-2 size-5 rounded-full border-4 border-white shadow-lg dark:border-zinc-950 ${tone}`} />
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-950/5 dark:border-zinc-800 dark:bg-zinc-900/70 dark:group-hover:border-emerald-900">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{item.title}</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {item.createdAt.toLocaleString("es-CR")}
          </p>
        </div>
        {item.description ? (
          <p className="mt-2 break-words text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.description}</p>
        ) : null}
      </div>
    </li>
  );
}

export function TimelineStageRail({
  stages,
}: {
  stages: { label: string; active?: boolean; done?: boolean }[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <div
          key={stage.label}
          className={`rounded-2xl border px-3 py-2 text-xs font-bold ${
            stage.active
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
              : stage.done
                ? "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
          }`}
        >
          {stage.label}
        </div>
      ))}
    </div>
  );
}
