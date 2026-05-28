import { PublicHero, PublicSectionHeader, PublicShell } from "@/components/repairlab/public-site";
import { RepairBadge, RepairButton, RepairContainer, RepairInlineAlert, RepairPanel } from "@/components/repairlab";

export default function ContactPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Contacto"
        title="Solicita una revision para tu equipo."
        description="Comparte la informacion basica de tu caso por los canales del taller. El formulario visual queda preparado para integracion segura futura."
        primaryHref="#formulario"
        primaryLabel="Ver formulario"
        secondaryHref="/services"
        secondaryLabel="Ver servicios"
      />

      <RepairContainer className="space-y-12 py-16">
        <PublicSectionHeader
          eyebrow="Comunicacion"
          title="Atencion clara desde el primer contacto"
          description="Por ahora este formulario es visual y no envia datos. Las integraciones reales se activaran cuando exista el contrato seguro."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div id="formulario">
          <RepairPanel className="space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                Formulario placeholder
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Solicitud de reparacion</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" />
              <Input label="Contacto" />
              <Input label="Equipo" />
              <Input label="Modelo / serial" />
            </div>
            <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Problema reportado
              <textarea
                rows={5}
                className="min-h-28 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-500 shadow-sm shadow-black/20 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Describe brevemente la falla"
              />
            </label>
            <RepairInlineAlert tone="info" title="Formulario visual">
              <p>Este formulario no envia datos todavia. Usa los canales del taller mientras se habilita la integracion segura.</p>
            </RepairInlineAlert>
            <button
              type="button"
              disabled
              className="min-h-11 rounded-full bg-zinc-300 px-5 py-2.5 text-sm font-black text-zinc-600 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400"
            >
              Envio disponible proximamente
            </button>
          </RepairPanel>
          </div>

          <aside className="space-y-5">
            <RepairPanel>
              <RepairBadge tone="emerald">Contacto</RepairBadge>
              <div className="mt-4 space-y-3 text-sm">
                <Info label="Telefono" value="+506 0000-0000" />
                <Info label="Email" value="soporte@repairlab.local" />
                <Info label="Horario" value="Lun - Vie: 09:00 - 17:00" />
              </div>
            </RepairPanel>
            <RepairPanel className="border-emerald-300/20 bg-emerald-500/10">
              <h3 className="text-xl font-black text-zinc-950 dark:text-zinc-50">WhatsApp</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                La integracion automatica de WhatsApp se implementara proximamente. Por ahora el contacto es manual.
              </p>
              <div className="mt-5">
                <RepairButton href="/services" tone="secondary" size="sm">Revisar servicios</RepairButton>
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
    <label className="grid gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
      {label}
      <input
        className="min-h-12 rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-500 shadow-sm shadow-black/20 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
        placeholder={label}
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words font-black text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}
