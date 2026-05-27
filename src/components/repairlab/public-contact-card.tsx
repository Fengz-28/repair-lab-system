import { RepairBadge } from "./index";

export function PublicContactCard({ ticketNumber }: { ticketNumber: string }) {
  return (
    <section
      id="contacto"
      className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm shadow-zinc-950/5 dark:border-emerald-900 dark:from-emerald-950/50 dark:to-zinc-950 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            Contacto
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">
            ¿Tienes dudas sobre tu reparacion?
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Contacta al taller indicando tu codigo de ticket. Asi podremos ubicar tu caso rapidamente sin exponer
            informacion interna del sistema.
          </p>
        </div>
        <RepairBadge tone="emerald">Codigo {ticketNumber}</RepairBadge>
      </div>
      <div className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
        Canal de contacto del taller disponible para seguimiento manual. WhatsApp automatico se implementara en una
        etapa futura.
      </div>
    </section>
  );
}

export function PublicTrackingFooter() {
  return (
    <footer className="mt-12 bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black text-white">
            Repair<span className="text-emerald-400">Lab</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Portal de seguimiento de reparacion para clientes. Consulta tu estado y documentos disponibles de forma
            segura usando tu enlace privado.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white">Seguimiento</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>Estado de reparacion</li>
            <li>Cotizacion disponible</li>
            <li>Factura y saldo</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>soporte@repairlab.local</li>
            <li>+506 0000-0000</li>
            <li>Lun - Vie: 09:00 - 17:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-500">
        RepairLab System. Portal de seguimiento de reparacion.
      </div>
    </footer>
  );
}
