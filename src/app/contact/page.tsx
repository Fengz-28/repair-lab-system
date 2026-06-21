import type { ComponentType } from "react";

import { CalendarCheck, FileText, SearchCheck, ShieldCheck, Wrench } from "lucide-react";

import { RepairButton, RepairContainer, RepairInlineAlert, RepairPanel } from "@/components/repairlab";
import { PublicSectionHeader, PublicShell } from "@/components/repairlab/public-site";

const contactEmail = "contacto@fengzlab.tech";

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_32%),linear-gradient(180deg,rgba(3,7,18,0.98),rgba(0,0,0,0.98))]">
        <RepairContainer className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              FengzLab / Contacto del taller
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-50 sm:text-5xl">
              Agenda una revision tecnica con informacion clara desde el inicio.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
              FengzLab es un laboratorio privado de reparacion electronica en Costa Rica. Trabajamos por cita para
              revisar cada caso con orden: diagnostico, cotizacion, reparacion, entrega y seguimiento cuando aplica.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <RepairButton href={`mailto:${contactEmail}?subject=Solicitud%20de%20revision%20FengzLab`}>
                Escribir al taller
              </RepairButton>
              <RepairButton href="/services" tone="secondary">
                Ver servicios
              </RepairButton>
            </div>
          </div>

          <RepairPanel className="repair-rgb-card repair-rgb-card-always space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Como atendemos</p>
            <div className="grid gap-3">
              <ContactSignal
                icon={CalendarCheck}
                title="Trabajo por cita"
                description="Coordinamos la recepcion para dedicar tiempo real al diagnostico y evitar entregas improvisadas."
              />
              <ContactSignal
                icon={SearchCheck}
                title="Diagnostico con contexto"
                description="Entre mas claro llegue el caso, mas rapido podemos priorizar pruebas y cotizacion."
              />
              <ContactSignal
                icon={ShieldCheck}
                title="Seguimiento profesional"
                description="Cuando el equipo entra al flujo del taller, el caso puede manejarse con ticket y trazabilidad."
              />
            </div>
          </RepairPanel>
        </RepairContainer>
      </section>

      <RepairContainer className="space-y-10 py-12 sm:py-14">
        <PublicSectionHeader
          eyebrow="Solicitud de servicio"
          title="Que enviar para preparar tu caso"
          description="No hay envio automatico desde esta pagina todavia. Usa el correo del taller y comparte estos datos para que la revision arranque con buen contexto."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <RepairPanel className="repair-rgb-card space-y-6">
            <div className="border-b border-white/10 pb-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Datos recomendados</p>
              <h2 className="mt-2 text-2xl font-black text-zinc-50">Describe el equipo y la falla</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Estos puntos ayudan a decidir si conviene diagnostico, mantenimiento, cambio de pieza o una revision
                mas profunda de placa.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <GuidanceCard icon={Wrench} title="Equipo" body="Tipo de equipo, marca, modelo y accesorios que incluye." />
              <GuidanceCard icon={FileText} title="Falla" body="Sintomas, cuando empezo, si hubo golpe, humedad o reparacion previa." />
              <GuidanceCard icon={SearchCheck} title="Objetivo" body="Indica si buscas diagnostico, reparacion, mantenimiento o cotizacion." />
              <GuidanceCard icon={ShieldCheck} title="Evidencia" body="Si tienes fotos o video, envialos solo cuando sean utiles y sin datos privados visibles." />
            </div>

            <RepairInlineAlert tone="info" title="Sin automatizacion de correo por ahora">
              <p>
                El correo funciona como canal de coordinacion del servicio. No hay formulario web ni envios automaticos conectados a esta pagina en esta etapa.
              </p>
            </RepairInlineAlert>
          </RepairPanel>

          <aside className="space-y-5">
            <RepairPanel className="repair-rgb-card space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Contacto</p>
              <div className="grid gap-3 text-sm">
                <Info label="Correo" value={contactEmail} />
                <Info label="Ubicacion" value="Costa Rica" />
                <Info label="Atencion" value="Por cita previa" />
              </div>
              <RepairButton href={`mailto:${contactEmail}?subject=Solicitud%20de%20revision%20FengzLab`} tone="secondary" size="sm">
                Enviar solicitud por correo
              </RepairButton>
            </RepairPanel>

            <RepairPanel className="repair-rgb-card border-cyan-300/20 bg-cyan-500/10">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Despues del ingreso</p>
              <h3 className="mt-3 text-xl font-black text-zinc-50">Proceso con trazabilidad</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Si el equipo entra al taller, el caso puede seguirse con diagnostico, cotizacion, documentos y portal
                de seguimiento cuando aplique.
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

function ContactSignal({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-500/10 text-cyan-200">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-black text-zinc-50">{title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function GuidanceCard({ icon: Icon, title, body }: { icon: ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-500/10 text-cyan-200">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="font-black text-zinc-50">{title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">{body}</p>
        </div>
      </div>
    </div>
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
