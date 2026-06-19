import { Clock3, Sparkles } from "lucide-react";

export function PublicTimelinePro({
  items,
}: {
  items: {
    id: string;
    title: string;
    createdAt: Date;
  }[];
}) {
  return (
    <section className="fengz-carbon-panel fengz-rgb-edge rounded-3xl border border-white/10 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
          <Clock3 className="size-3.5" />
          Actividad pública
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-50">Línea de tiempo de reparación</h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm text-zinc-400">
          Aún no hay eventos públicos para mostrar.
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="relative grid grid-cols-[44px_1fr] gap-3">
              <div className="relative flex justify-center">
                <span className="grid size-10 place-items-center rounded-full border border-cyan-300/25 bg-cyan-500/10 text-xs font-black text-cyan-100">
                  <Sparkles className="size-4" />
                </span>
                {index < items.length - 1 ? (
                  <span className="absolute top-10 h-[calc(100%+1rem)] w-px bg-white/10" />
                ) : null}
              </div>
              <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
                <p className="break-words text-sm font-black text-zinc-50">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-zinc-400">{item.createdAt.toLocaleString("es-CR")}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
