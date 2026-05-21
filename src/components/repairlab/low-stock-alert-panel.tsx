import { RepairButton, RepairPanel } from "./index";

export function LowStockAlertPanel({
  items,
}: {
  items: {
    id: string;
    name: string;
    sku: string | null;
    quantityOnHand: number;
    reorderLevel: number;
  }[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <RepairPanel className="border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/35">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
            Alerta de stock
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">
            {items.length} items en o por debajo del minimo
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Revisa repuestos criticos antes de aprobar trabajos que dependan de inventario controlado.
          </p>
        </div>
        <RepairButton href="#catalogo" tone="secondary">
          Revisar inventario
        </RepairButton>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <div key={item.id} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-900 dark:bg-zinc-950">
            <p className="break-words font-black text-zinc-950 dark:text-zinc-50">{item.name}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.sku ? `SKU: ${item.sku}` : "Sin SKU"}</p>
            <p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-200">
              Stock {item.quantityOnHand} / minimo {item.reorderLevel}
            </p>
          </div>
        ))}
      </div>
    </RepairPanel>
  );
}
