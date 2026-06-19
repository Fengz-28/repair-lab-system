import type { TicketStatus } from "@prisma/client";

import type { ComponentType } from "react";
import {
  CheckCircle2,
  ClipboardPlus,
  Microscope,
  ScanSearch,
  Settings2,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

const stages: { status: TicketStatus; label: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  { status: "RECEIVED", label: "Recibido", description: "Equipo ingresado", icon: ClipboardPlus },
  { status: "INITIAL_REVIEW", label: "Revisión inicial", description: "Inspección visual y pruebas base", icon: ScanSearch },
  { status: "DIAGNOSIS", label: "Diagnóstico", description: "Análisis técnico", icon: Microscope },
  { status: "WAITING_APPROVAL", label: "Esperando aprobación", description: "Cotización enviada", icon: ShieldCheck },
  { status: "APPROVED", label: "Aprobado", description: "Trabajo autorizado", icon: CheckCircle2 },
  { status: "REPAIR_IN_PROGRESS", label: "En reparación", description: "Trabajo en curso", icon: Wrench },
  { status: "READY_FOR_PICKUP", label: "Listo para retiro", description: "Equipo preparado", icon: Settings2 },
  { status: "DELIVERED", label: "Entregado", description: "Caso cerrado", icon: Truck },
];

export function PublicRepairProgress({ status }: { status: TicketStatus }) {
  const currentIndex = stages.findIndex((stage) => stage.status === status);
  const isCancelled = status === "CANCELLED";

  return (
    <section className="fengz-carbon-panel fengz-rgb-edge repair-premium-card rounded-3xl border border-white/10 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Avance de reparación</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-50">Progreso del servicio</h2>
        </div>
        {isCancelled ? (
          <span className="inline-flex w-fit rounded-full border border-red-400/35 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-100">
            Ticket cancelado
          </span>
        ) : null}
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        {stages.map((stage, index) => {
          const isDone = !isCancelled && currentIndex >= 0 && index < currentIndex;
          const isCurrent = !isCancelled && index === currentIndex;
          const stateClass = isDone
            ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-100"
            : isCurrent
              ? "border-cyan-400/35 bg-cyan-500/15 text-cyan-100 ring-2 ring-cyan-500/25"
              : "border-white/10 bg-zinc-950/75 text-zinc-400";

          return (
            <li key={stage.status} className={`relative rounded-2xl border p-4 ${stateClass}`}>
              <div className="flex items-center gap-3 md:block">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-zinc-950 text-xs font-black shadow-sm shadow-black/30">
                  <stage.icon className={`size-4 ${isDone || isCurrent ? "text-cyan-200" : "text-zinc-500"}`} />
                </span>
                <div className="min-w-0 md:mt-3">
                  <p className="break-words text-sm font-black">{stage.label}</p>
                  <p className="mt-1 text-xs opacity-75">{stage.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

