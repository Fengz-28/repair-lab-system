"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { RepairEmptyState } from "@/components/repairlab";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export type NotificationCenterItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: NotificationSeverity;
  count?: number;
};

export function NotificationsCenter({ items }: { items: NotificationCenterItem[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const totalCount = items.reduce((total, item) => total + (item.count ?? 1), 0);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Abrir notificaciones${totalCount ? `, ${totalCount} pendientes` : ""}`}
        onClick={() => setOpen((current) => !current)}
        className="repair-button-motion repair-focus-ring relative grid min-h-10 min-w-10 place-items-center rounded-full border border-white/10 bg-zinc-950/85 text-sm font-black text-zinc-300 shadow-sm shadow-black/20 hover:border-amber-300/25 hover:bg-white/[0.06] hover:text-amber-100"
      >
        <span aria-hidden="true">N</span>
        {totalCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full border border-black bg-amber-400 px-1.5 py-0.5 text-[10px] font-black leading-none text-black">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Centro de notificaciones"
          className="repair-panel-reveal absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40"
        >
          <div className="border-b border-white/10 bg-black/35 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Notificaciones
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-zinc-50">Centro de notificaciones</h2>
              <span className="rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-black text-zinc-300">
                {items.length} alertas
              </span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {items.length ? (
              <ul className="grid gap-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <NotificationItem item={item} onOpen={() => setOpen(false)} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyNotificationsState />
            )}
          </div>

          <div className="border-t border-white/10 bg-black/35 px-4 py-3 text-xs leading-5 text-zinc-500">
            Derivado de datos actuales. La lectura de notificaciones llegará en una fase futura.
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NotificationItem({
  item,
  onOpen,
}: {
  item: NotificationCenterItem;
  onOpen?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onOpen}
      className={`repair-focus-ring group flex items-start gap-3 rounded-2xl border p-3 text-left transition hover:bg-white/[0.06] ${severityClass(item.severity)}`}
    >
      <span className={`mt-1 size-2.5 shrink-0 rounded-full ${severityDot(item.severity)}`} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="break-words text-sm font-black text-zinc-50">{item.title}</span>
          {item.count ? (
            <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-black text-zinc-300">
              {item.count}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block break-words text-xs leading-5 text-zinc-400">
          {item.description}
        </span>
      </span>
      <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500 group-hover:text-zinc-200">
        Abrir
      </span>
    </Link>
  );
}

export function EmptyNotificationsState() {
  return (
    <RepairEmptyState
      compact
      eyebrow="Notificaciones"
      title="Sin alertas por ahora"
      description="No hay señales derivadas que requieran atención inmediata."
      icon="N"
    />
  );
}

function severityClass(severity: NotificationSeverity) {
  const classes: Record<NotificationSeverity, string> = {
    info: "border-cyan-300/15 bg-cyan-500/10 hover:border-cyan-300/25",
    success: "border-emerald-300/15 bg-emerald-500/10 hover:border-emerald-300/25",
    warning: "border-amber-300/20 bg-amber-500/10 hover:border-amber-300/30",
    error: "border-red-300/20 bg-red-500/10 hover:border-red-300/30",
  };

  return classes[severity];
}

function severityDot(severity: NotificationSeverity) {
  const classes: Record<NotificationSeverity, string> = {
    info: "bg-cyan-300 shadow-cyan-400/30",
    success: "bg-emerald-300 shadow-emerald-400/30",
    warning: "bg-amber-300 shadow-amber-400/30",
    error: "bg-red-300 shadow-red-400/30",
  };

  return classes[severity];
}
