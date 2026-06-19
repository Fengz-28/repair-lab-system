import { formatMoney } from "@/modules/customers/customer-labels";

import { RepairBadge, RepairButton, RepairFloatingPanel } from "./index";

export function CustomerSidebar({
  contact,
  phone,
  whatsappPhone,
  email,
  firstTicketAt,
  ticketCount,
  invoiceCount,
  totalInvoiced,
  totalPaid,
  balanceDue,
}: {
  contact: string;
  phone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  firstTicketAt: Date | null;
  ticketCount: number;
  invoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-28">
      <RepairFloatingPanel>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300 dark:text-cyan-300">
          Contacto rápido
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <Info label="Principal" value={contact} />
          <Info label="Teléfono" value={phone ?? "No registrado"} />
          <Info label="WhatsApp" value={whatsappPhone ?? "No registrado"} />
          <Info label="Correo" value={email ?? "No registrado"} />
        </div>
      </RepairFloatingPanel>

      <RepairFloatingPanel className={balanceDue > 0 ? "border-amber-300/20 shadow-amber-950/10" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300 dark:text-cyan-300">
              Inteligencia CRM
            </p>
            <h2 className="mt-2 text-xl font-black text-zinc-950 dark:text-zinc-50">Resumen</h2>
          </div>
          <RepairBadge tone={balanceDue > 0 ? "warning" : "cyan"}>
            {balanceDue > 0 ? "Por cobrar" : "Al día"}
          </RepairBadge>
        </div>
        <div className="mt-5 grid gap-3">
          <MiniMetric label="Primer ticket" value={firstTicketAt?.toLocaleDateString("es-CR") ?? "Sin tickets"} />
          <MiniMetric label="Tickets" value={String(ticketCount)} />
          <MiniMetric label="Facturas" value={String(invoiceCount)} />
          <MiniMetric label="Facturado" value={formatMoney(totalInvoiced)} />
          <MiniMetric label="Pagado" value={formatMoney(totalPaid)} />
          <MiniMetric label="Saldo pendiente" value={formatMoney(balanceDue)} highlight={balanceDue > 0} />
        </div>
      </RepairFloatingPanel>

      <RepairFloatingPanel>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300 dark:text-cyan-300">
          Acciones
        </p>
        <div className="mt-4 grid gap-2">
          <RepairButton href="/admin/intake" size="sm">
            Nueva recepción
          </RepairButton>
          <RepairButton href="/admin/tickets" tone="secondary" size="sm">
            Ver tickets
          </RepairButton>
          <RepairButton href="/admin/customers" tone="ghost" size="sm">
            Volver al CRM
          </RepairButton>
        </div>
      </RepairFloatingPanel>
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/75 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-white/10 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={highlight ? "break-words text-right text-sm font-black text-amber-700 dark:text-amber-200" : "break-words text-right text-sm font-black text-zinc-950 dark:text-zinc-50"}>
        {value}
      </span>
    </div>
  );
}

