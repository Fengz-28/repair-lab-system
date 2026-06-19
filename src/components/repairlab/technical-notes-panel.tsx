import type React from "react";

import { RepairPanel } from "@/components/repairlab";

export function TechnicalNotesPanel({ children }: { children: React.ReactNode }) {
  return (
    <RepairPanel className="bg-zinc-950/75">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Técnico</p>
      <h2 className="mt-1 text-lg font-black text-zinc-950 dark:text-zinc-50">Notas técnicas</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Diagnóstico, trabajo realizado, recomendaciones y observaciones internas.
      </p>
      <div className="mt-5">{children}</div>
    </RepairPanel>
  );
}
