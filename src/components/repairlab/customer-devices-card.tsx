import { RepairPanel } from "./index";

export function CustomerDevicesCard({
  devices,
}: {
  devices: {
    id: string;
    label: string;
    serial: string | null;
    type: string;
    ticketCount: number;
  }[];
}) {
  return (
    <RepairPanel className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
          Equipos
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Dispositivos relacionados</h2>
      </div>
      {devices.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm text-zinc-400">
          No hay equipos registrados.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {devices.map((device) => (
            <article key={device.id} className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-500/10 text-sm font-black text-emerald-100">
                  EQ
                </div>
                <div className="min-w-0">
                  <p className="break-words font-black text-zinc-950 dark:text-zinc-50">{device.label}</p>
                  <p className="mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">Serial: {device.serial ?? "No registrado"}</p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {device.type} / {device.ticketCount} tickets
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </RepairPanel>
  );
}
