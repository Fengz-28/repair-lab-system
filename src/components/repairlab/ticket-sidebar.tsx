import type React from "react";

import { RepairPanel } from "@/components/repairlab";

export function TicketSidebar({ children }: { children: React.ReactNode }) {
  return <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">{children}</aside>;
}

export function TicketSidebarCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <RepairPanel>
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">{eyebrow}</p> : null}
      <h2 className="mt-1 text-base font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
      <div className="mt-4">{children}</div>
    </RepairPanel>
  );
}
