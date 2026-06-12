import { RepairButton, RepairContainer, RepairInlineAlert, RepairPanel } from "@/components/repairlab";
import { PublicHero, PublicSectionHeader, PublicShell } from "@/components/repairlab/public-site";

export default function ContactPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Contacto"
        title="Solicita una revision para tu equipo."
        description="Comparte la informacion base de tu caso y te orientamos con diagnostico, cotizacion y siguientes pasos para la reparacion."
        primaryHref="#formulario"
        primaryLabel="Ver formulario"
        secondaryHref="/services"
        secondaryLabel="Ver servicios"
      />

      <RepairContainer className="space-y-12 py-16">
        <PublicSectionHeader
          eyebrow="Comunicacion"
          title="Atencion clara desde el primer contacto"
          description="Usa este formulario como guia de preingreso y, mientras activamos el envio desde el sitio, coordina por llamada o correo con el taller."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div id="formulario">
            <RepairPanel className="repair-rgb-card repair-rgb-card-always space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  Preingreso del caso
                </p>
                <h2 className="mt-2 text-2xl font-black text-zinc-50">Solicitud de reparacion</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nombre" />
                <Input label="Contacto" />
                <Input label="Equipo" />
                <Input label="Modelo / serial" />
              </div>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Problema reportado
                <textarea
                  rows={5}
                  className="repair-input-surface min-h-28"
                  placeholder="Describe brevemente la falla"
                />
              </label>
              <RepairInlineAlert tone="info" title="Canales activos">
                <p>
                  El envio desde el sitio sigue en preparacion. Para abrir tu caso hoy, usa llamada o correo y comparte
                  estos mismos datos con el taller.
                </p>
              </RepairInlineAlert>
              <button
                type="button"
                disabled
                className="min-h-11 rounded-full border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm font-black text-zinc-500 disabled:cursor-not-allowed"
              >
                Envio web en preparacion
              </button>
            </RepairPanel>
          </div>

          <aside className="space-y-5">
            <RepairPanel className="repair-rgb-card">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Contacto</p>
              <div className="mt-4 space-y-3 text-sm">
                <Info label="Telefono" value="+506 0000-0000" />
                <Info label="Correo" value="contacto@fengzlab.local" />
                <Info label="Horario" value="Lun - Vie: 09:00 - 17:00" />
              </div>
              <div className="mt-5 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <RepairButton href="tel:+50600000000" tone="secondary" size="sm">
                    Llamar
                  </RepairButton>
                  <RepairButton href="mailto:contacto@fengzlab.local" tone="secondary" size="sm">
                    Correo
                  </RepairButton>
                </div>
              </div>
            </RepairPanel>

            <RepairPanel className="repair-rgb-card border-cyan-300/20 bg-cyan-500/10">
              <h3 className="text-xl font-black text-zinc-50">Seguimiento profesional</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Cuando tu caso entre al flujo del taller, recibiras trazabilidad clara por ticket, cotizacion y portal
                de seguimiento.
              </p>
              <div className="mt-5">
                <RepairButton href="/services" tone="secondary" size="sm">
                  Revisar servicios
                </RepairButton>
              </div>
            </RepairPanel>
          </aside>
        </div>
      </RepairContainer>
    </PublicShell>
  );
}

function Input({ label }: { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-200">
      {label}
      <input className="repair-input-surface" placeholder={label} />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className="mt-1 break-words font-black text-zinc-50">{value}</p>
    </div>
  );
}
