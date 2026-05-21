import { RepairStatCard } from "./index";

export function InventoryStatsGrid({
  totalItems,
  trackedItems,
  lowStockItems,
  outOfStockItems,
  estimatedValue,
  recentMovements,
}: {
  totalItems: number;
  trackedItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  estimatedValue: string;
  recentMovements: number;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <RepairStatCard label="Items" value={totalItems} tone="emerald" />
      <RepairStatCard label="Controlan stock" value={trackedItems} tone="cyan" />
      <RepairStatCard label="Stock bajo" value={lowStockItems} tone={lowStockItems > 0 ? "warning" : "neutral"} />
      <RepairStatCard label="Agotados" value={outOfStockItems} tone={outOfStockItems > 0 ? "warning" : "neutral"} />
      <RepairStatCard label="Valor estimado" value={estimatedValue} tone="neutral" />
      <RepairStatCard label="Movimientos" value={recentMovements} tone="cyan" />
    </section>
  );
}
