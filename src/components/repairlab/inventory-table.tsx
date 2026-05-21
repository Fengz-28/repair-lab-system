export function RepairInventoryTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
