import { AnimatedShaderBackground } from "@/components/repairlab/animated-shader-background";
import { RepairBadge } from "@/components/repairlab";
import { Mail, MessageSquare, PhoneCall } from "lucide-react";

export function PublicContactCard({ ticketNumber }: { ticketNumber: string }) {
  return (
    <section
      id="contacto"
      className="fengz-carbon-panel fengz-rgb-edge-static repair-premium-card rounded-3xl border border-cyan-300/20 p-5 shadow-sm shadow-black/30 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            <MessageSquare className="size-3.5" />
            Contacto
          </p>
          <h2 className="mt-2 text-2xl font-black text-zinc-50">Â¿Tienes dudas sobre tu reparaciÃ³n?</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Contacta al taller indicando tu codigo de ticket. AsÃ­ podremos ubicar tu caso rapidamente sin exponer
            informaciÃ³n interna del sistema.
          </p>
        </div>
        <RepairBadge tone="cyan">Codigo {ticketNumber}</RepairBadge>
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-500/10 p-4 text-sm font-semibold text-cyan-100 sm:grid-cols-2">
        <p className="inline-flex items-center gap-2">
          <PhoneCall className="size-4" />
          Atencion por cita
        </p>
        <p className="inline-flex items-center gap-2">
          <Mail className="size-4" />
          contacto@fengzlab.tech
        </p>
      </div>
    </section>
  );
}

export function PublicTrackingFooter() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-white/10 bg-zinc-950 text-zinc-300">
      <AnimatedShaderBackground intensity="sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 to-black/90" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black text-white">
            Fengz<span className="text-cyan-400">Lab</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Portal de seguimiento para clientes. Consulta estado, cotizaciÃ³n y factura de forma segura con tu enlace
            privado.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white">Seguimiento</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>Estado de reparaciÃ³n</li>
            <li>CotizaciÃ³n disponible</li>
            <li>Factura y saldo</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>contacto@fengzlab.tech</li>
            <li>Atencion por cita</li>
            <li>Lun - Vie: 09:00 - 17:00</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5 text-center text-xs text-zinc-500">
        FengzLab. Portal de seguimiento de reparaciÃ³n.
      </div>
    </footer>
  );
}
