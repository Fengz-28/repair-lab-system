export function PublicTimeline({
  items,
}: {
  items: {
    id: string;
    title: string;
    createdAt: Date;
  }[];
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
          Actividad publica
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Timeline de reparacion</h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          Aun no hay eventos publicos para mostrar.
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="relative grid grid-cols-[44px_1fr] gap-3">
              <div className="relative flex justify-center">
                <span className="grid size-10 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-black text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                  {index + 1}
                </span>
                {index < items.length - 1 ? (
                  <span className="absolute top-10 h-[calc(100%+1rem)] w-px bg-zinc-200 dark:bg-zinc-800" />
                ) : null}
              </div>
              <div className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {item.createdAt.toLocaleString("es-CR")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
