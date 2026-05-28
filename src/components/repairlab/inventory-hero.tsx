import { RepairBadge, RepairButton, RepairContainer, RepairFloatingPanel } from "./index";

export type InventoryHeroStats = {
  totalItems: number;
  trackedItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  estimatedValue: string;
};

export function InventoryHero({ stats }: { stats: InventoryHeroStats }) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.15),rgba(0,0,0,0.86))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_47%,rgba(255,255,255,0.08)_48%,transparent_50%)] [background-size:46px_46px]" />
      <RepairContainer className="relative py-12 sm:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Admin / Inventario</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Catálogo e inventario
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Controla servicios, productos, repuestos y stock real del taller sin convertir RepairLab en un ERP
              pesado.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <RepairBadge tone="emerald">{stats.totalItems} items</RepairBadge>
              <RepairBadge tone="cyan">{stats.trackedItems} con stock</RepairBadge>
              <RepairBadge tone={stats.lowStockItems > 0 ? "warning" : "emerald"}>
                {stats.lowStockItems} stock bajo
              </RepairBadge>
            </div>
          </div>

          <RepairFloatingPanel className="w-full bg-zinc-900/45 lg:max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Pulso de inventario</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <HeroMetric label="Agotados" value={String(stats.outOfStockItems)} />
              <HeroMetric label="Valor estimado" value={stats.estimatedValue} />
            </div>
            <div className="mt-5 grid gap-2 sm:flex">
              <RepairButton href="#crear-item" tone="primary">
                Crear item
              </RepairButton>
              <RepairButton href="#catalogo" tone="secondary">
                Ver catalogo
              </RepairButton>
            </div>
          </RepairFloatingPanel>
        </div>
      </RepairContainer>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/45 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-white">{value}</p>
    </div>
  );
}
