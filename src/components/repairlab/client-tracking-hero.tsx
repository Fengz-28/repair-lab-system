import { RepairBadge, RepairButton, RepairContainer } from "./index";

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
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.28),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.16),transparent_28%),linear-gradient(135deg,rgba(9,9,11,0.15),rgba(0,0,0,0.88))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_47%,rgba(255,255,255,0.08)_48%,transparent_50%)] [background-size:48px_48px]" />
      <RepairContainer className="relative py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
              RepairLab / Portal cliente
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Estado de reparacion
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Consulta el avance de tu equipo, revisa documentos disponibles y usa tu codigo de ticket para
              comunicarte con el taller.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {ticketNumber ? <RepairBadge tone="emerald">Ticket {ticketNumber}</RepairBadge> : null}
              {statusLabel ? <RepairBadge tone="cyan">{statusLabel}</RepairBadge> : null}
              {createdAt ? (
                <RepairBadge>Ingreso {createdAt.toLocaleDateString("es-CR")}</RepairBadge>
              ) : null}
            </div>
          </div>

          <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur lg:max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Equipo en taller</p>
            <p className="mt-3 break-words text-2xl font-black">{deviceLabel ?? "Seguimiento seguro"}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              La informacion mostrada aqui es publica para este enlace y no incluye notas internas del taller.
            </p>
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
