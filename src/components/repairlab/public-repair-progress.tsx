import type { TicketStatus } from "@prisma/client";

const stages: { status: TicketStatus; label: string; description: string }[] = [
  { status: "RECEIVED", label: "Recibido", description: "Equipo ingresado" },
  { status: "INITIAL_REVIEW", label: "En revision", description: "Revision inicial" },
  { status: "DIAGNOSIS", label: "Diagnostico", description: "Analisis tecnico" },
  { status: "WAITING_APPROVAL", label: "Esperando aprobacion", description: "Cotizacion enviada" },
  { status: "APPROVED", label: "Aprobado", description: "Trabajo autorizado" },
  { status: "REPAIR_IN_PROGRESS", label: "En reparacion", description: "Trabajo en curso" },
  { status: "READY_FOR_PICKUP", label: "Listo para entrega", description: "Equipo preparado" },
  { status: "DELIVERED", label: "Entregado", description: "Caso cerrado" },
];

export function PublicRepairProgress({ status }: { status: TicketStatus }) {
  const currentIndex = stages.findIndex((stage) => stage.status === status);
  const isCancelled = status === "CANCELLED";

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-5 shadow-sm shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
            Avance de reparacion
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Progreso del servicio</h2>
        </div>
        {isCancelled ? (
          <span className="inline-flex w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            Ticket cancelado
          </span>
        ) : null}
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        {stages.map((stage, index) => {
          const isDone = !isCancelled && currentIndex >= 0 && index < currentIndex;
          const isCurrent = !isCancelled && index === currentIndex;
          const stateClass = isDone
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
            : isCurrent
              ? "border-cyan-300 bg-cyan-50 text-cyan-800 ring-2 ring-cyan-200 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-100 dark:ring-cyan-900/70"
              : "border-white/10 bg-zinc-950/75 text-zinc-400";

          return (
            <li key={stage.status} className={`relative rounded-2xl border p-4 ${stateClass}`}>
              <div className="flex items-center gap-3 md:block">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-black shadow-sm shadow-black/30">
                  {isDone ? "OK" : index + 1}
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
