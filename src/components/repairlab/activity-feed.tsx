import type React from "react";

import { RepairPanel } from "@/components/repairlab";

export function ActivityFeed({
  title,
  eyebrow,
  empty,
  children,
}: {
  title: string;
  eyebrow?: string;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <RepairPanel>
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">{eyebrow}</p> : null}
      <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
      <div className="mt-4">
        {empty ? <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay registros para mostrar.</p> : children}
      </div>
    </RepairPanel>
  );
}
