import { RepairPanel } from "@/components/repairlab";

export function TicketDeviceCard({
  device,
  serial,
  issue,
  condition,
}: {
  device: string;
  serial: string;
  issue: string;
  condition: string;
}) {
  return (
    <RepairPanel>
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-lg font-black text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
          HW
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">Equipo</p>
          <h2 className="mt-1 break-words text-lg font-black text-zinc-950 dark:text-zinc-50">{device}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Serial: {serial}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Info label="Problema reportado" value={issue} />
        <Info label="Condicion inicial" value={condition} />
      </div>
    </RepairPanel>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
      <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 break-words text-sm leading-6 text-zinc-700 dark:text-zinc-200">{value}</p>
    </div>
  );
}
