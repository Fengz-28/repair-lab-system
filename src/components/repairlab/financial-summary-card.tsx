import type React from "react";

import { RepairBadge, RepairPanel } from "@/components/repairlab";

export function FinancialSummaryCard({
  title,
  number,
  total,
  status,
  children,
}: {
  title: string;
  number?: string;
  total?: string;
  status?: string;
  children?: React.ReactNode;
}) {
  return (
    <RepairPanel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">{title}</p>
          {number ? <h2 className="mt-1 break-words text-lg font-black text-zinc-950 dark:text-zinc-50">{number}</h2> : null}
        </div>
        {status ? <RepairBadge tone="emerald">{status}</RepairBadge> : null}
      </div>
      {total ? <p className="mt-5 text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">{total}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </RepairPanel>
  );
}
