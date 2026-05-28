import { RepairPanel } from "@/components/repairlab";

export function TicketCustomerCard({
  name,
  phone,
  email,
  whatsapp,
}: {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
}) {
  return (
    <RepairPanel>
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-500/10 text-lg font-black text-emerald-100">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Cliente</p>
          <h2 className="mt-1 break-words text-lg font-black text-zinc-950 dark:text-zinc-50">{name}</h2>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Telefono" value={phone} />
        <Info label="WhatsApp" value={whatsapp} />
        <Info label="Email" value={email} wide />
      </dl>
    </RepairPanel>
  );
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="break-words font-semibold text-zinc-950 dark:text-zinc-50">{value}</dd>
    </div>
  );
}
