import { AnimatedShaderBackground } from "@/components/repairlab/animated-shader-background";
import { RepairBadge, RepairButton, RepairContainer } from "@/components/repairlab";
import { ShieldCheck, Ticket, Wrench } from "lucide-react";

export function ClientTrackingHero({
  ticketNumber,
  statusLabel,
  deviceLabel,
  createdAt,
}: {
  ticketNumber?: string;
  statusLabel?: string;
  deviceLabel?: string;
  createdAt?: Date;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-zinc-950 text-white">
      <AnimatedShaderBackground className="z-0" intensity="md" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.28),rgba(0,0,0,0.9))]" />
      <RepairContainer className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
              Fengz Lab / Portal de seguimiento
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Estado de reparación
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Consulta el avance de tu equipo, revisa documentos disponibles y usa tu código de ticket para
              comunicarte con el taller.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {ticketNumber ? (
                <RepairBadge tone="cyan">
                  <Ticket className="size-3.5" />
                  Ticket {ticketNumber}
                </RepairBadge>
              ) : null}
              {statusLabel ? <RepairBadge tone="cyan">{statusLabel}</RepairBadge> : null}
              {createdAt ? (
                <RepairBadge>Ingreso {createdAt.toLocaleDateString("es-CR")}</RepairBadge>
              ) : null}
            </div>
          </div>

          <div className="fengz-carbon-panel fengz-rgb-edge-static repair-premium-card w-full rounded-3xl border border-white/15 p-5 shadow-2xl shadow-black/30 backdrop-blur lg:max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Equipo en taller</p>
            <p className="mt-3 break-words text-2xl font-black">{deviceLabel ?? "Seguimiento seguro"}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              La información mostrada aquí es pública para este enlace y no incluye notas internas del taller.
            </p>
            <div className="mt-4 grid gap-2 text-xs text-zinc-300">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-cyan-300" />
                Enlace privado por token
              </div>
              <div className="inline-flex items-center gap-2">
                <Wrench className="size-3.5 text-cyan-300" />
                Avance técnico en tiempo real
              </div>
            </div>
            <div className="mt-5">
              <RepairButton href="#contacto" tone="primary">
                Contactar al taller
              </RepairButton>
            </div>
          </div>
        </div>
      </RepairContainer>
    </section>
  );
}

