import { RepairBadge } from "./index";

export function InventoryItemCard({
  title,
  subtitle,
  sku,
  typeLabel,
  price,
  cost,
  duration,
  active,
  publicReady,
  stockLabel,
  stockTone,
  children,
}: {
  title: string;
  subtitle: string;
  sku: string | null;
  typeLabel: string;
  price: string;
  cost: string | null;
  duration: string | null;
  active: boolean;
  publicReady: boolean;
  stockLabel: string;
  stockTone: "neutral" | "emerald" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900">
            {typeLabel.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="break-words text-xl font-black text-zinc-950 dark:text-zinc-50">{title}</p>
            <p className="mt-1 break-words text-sm font-medium text-zinc-500 dark:text-zinc-400">{subtitle}</p>
            {sku ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">SKU {sku}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <RepairBadge tone={stockTone}>{stockLabel}</RepairBadge>
          <RepairBadge tone={active ? "emerald" : "neutral"}>{active ? "Activo" : "Inactivo"}</RepairBadge>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Mini label="Tipo" value={typeLabel} />
        <Mini label="Precio" value={price} />
        <Mini label="Costo" value={cost ?? "No definido"} />
        <Mini label="Duracion" value={duration ?? "No definida"} />
        <Mini label="Web publica" value={publicReady ? "Preparado" : "Interno"} />
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
        {children}
      </div>
    </article>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}
