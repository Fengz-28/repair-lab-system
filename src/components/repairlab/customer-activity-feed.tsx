import Link from "next/link";

import { RepairPanel } from "./index";

export function CustomerActivityFeed({
  activity,
}: {
  activity: {
    id: string;
    ticketId: string;
    ticketNumber: string;
    title: string;
    createdAt: Date;
  }[];
}) {
  return (
    <RepairPanel className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300 dark:text-cyan-300">
          Actividad
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Movimientos recientes</h2>
      </div>
      {activity.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm text-zinc-400">
          No hay actividad registrada.
        </p>
      ) : (
        <ol className="space-y-4">
          {activity.map((event, index) => (
            <li key={event.id} className="relative grid grid-cols-[42px_1fr] gap-3">
              <div className="relative flex justify-center">
                <span className="grid size-10 place-items-center rounded-full border border-cyan-300/25 bg-cyan-500/10 text-xs font-black text-cyan-100">
                  {index + 1}
                </span>
                {index < activity.length - 1 ? (
                  <span className="absolute top-10 h-[calc(100%+1rem)] w-px bg-white/10" />
                ) : null}
              </div>
              <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link className="font-black text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50" href={`/admin/tickets/${event.ticketId}`}>
                    {event.ticketNumber}
                  </Link>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {event.createdAt.toLocaleString("es-CR")}
                  </span>
                </div>
                <p className="mt-2 break-words text-sm leading-6 text-zinc-600 dark:text-zinc-300">{event.title}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </RepairPanel>
  );
}

