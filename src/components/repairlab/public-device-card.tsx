export function DevicePublicCard({
  deviceLabel,
  serial,
  reportedIssue,
}: {
  deviceLabel: string;
  serial: string | null;
  reportedIssue: string;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-lg font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          EQ
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Equipo recibido
          </p>
          <h2 className="mt-2 break-words text-2xl font-black text-zinc-950 dark:text-zinc-50">{deviceLabel}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Serial: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{serial ?? "No registrado"}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Problema reportado
        </p>
        <p className="mt-2 break-words text-sm leading-6 text-zinc-800 dark:text-zinc-200">{reportedIssue}</p>
      </div>
    </section>
  );
}
