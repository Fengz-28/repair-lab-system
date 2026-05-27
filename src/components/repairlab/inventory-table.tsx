export function RepairInventoryTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-sm shadow-black/30">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
