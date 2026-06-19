import { Cpu, Hash, Wrench } from "lucide-react";

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
    <section className="fengz-carbon-panel fengz-rgb-edge rounded-3xl border border-white/10 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-500/10 text-lg font-black text-cyan-100">
          <Cpu className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            Equipo recibido
          </p>
          <h2 className="mt-2 break-words text-2xl font-black text-zinc-50">{deviceLabel}</h2>
          <p className="mt-1 inline-flex items-center gap-2 text-sm text-zinc-400">
            <Hash className="size-3.5 text-cyan-300" />
            Serial: <span className="font-semibold text-zinc-200">{serial ?? "No registrado"}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
          <Wrench className="size-3.5 text-cyan-300" />
          Problema reportado
        </p>
        <p className="mt-2 break-words text-sm leading-6 text-zinc-200">{reportedIssue}</p>
      </div>
    </section>
  );
}
