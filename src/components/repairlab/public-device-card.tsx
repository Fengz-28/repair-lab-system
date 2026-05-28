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
    <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-500/10 text-lg font-black text-emerald-100">
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

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
          Problema reportado
        </p>
        <p className="mt-2 break-words text-sm leading-6 text-zinc-800 dark:text-zinc-200">{reportedIssue}</p>
      </div>
    </section>
  );
}
