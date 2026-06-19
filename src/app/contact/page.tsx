import type { ComponentType } from "react";

import { MessageSquare, ShieldCheck, Wrench } from "lucide-react";

import { RepairBadge, RepairButton, RepairContainer, RepairInlineAlert, RepairPanel } from "@/components/repairlab";
import { PublicSectionHeader, PublicShell } from "@/components/repairlab/public-site";

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.96),rgba(0,0,0,0.98))]">
        <RepairContainer className="space-y-8 py-10 sm:py-12">
          <div className="flex flex-wrap items-center gap-3">
            <RepairBadge tone="cyan">Contacto directo</RepairBadge>
            <RepairBadge>Preingreso del caso</RepairBadge>
            <RepairBadge tone="neutral">Atención del taller</RepairBadge>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Contacto / Diagnóstico / Seguimiento
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-50 sm:text-5xl">
                Abre tu caso con una entrada clara desde el primer mensaje.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                Comparte la información base de tu equipo y te orientamos con diagnóstico, cotización y siguientes
                pasos para la reparación. Esta página está pensada para que el contacto se sienta profesional, rápido
                y fácil de usar desde celular.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <RepairButton href="#formulario">Ver formulario</RepairButton>
                <RepairButton href="/services" tone="secondary">
                  Ver servicios
                </RepairButton>
              </div>
            </div>

            <RepairPanel className="repair-rgb-card space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Qué obtienes aquí</p>
              <div className="grid gap-3">
                <ContactSignal
                  icon={MessageSquare}
                  title="Preingreso ordenado"
                  description="Recogemos los datos clave para entender tu caso antes de recibir el equipo."
                />
                <ContactSignal
                  icon={Wrench}
                  title="Ruta técnica clara"
                  description="Te guiamos con diagnóstico, cotización y el mejor siguiente paso para tu reparación."
                />
                <ContactSignal
                  icon={ShieldCheck}
                  title="Seguimiento profesional"
                  description="Cuando tu caso entre al flujo del taller, tendrás ticket, documentos y trazabilidad."
                />
              </div>
            </RepairPanel>
          </div>
        </RepairContainer>
      </section>

      <RepairContainer className="space-y-10 py-12 sm:py-14">
        <PublicSectionHeader
          eyebrow="Comunicación"
          title="Atención clara desde el primer contacto"
          description="Usa este formulario como guía de preingreso y, mientras activamos el envío desde el sitio, coordina por llamada o correo con el taller."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div id="formulario">
            <RepairPanel className="repair-rgb-card repair-rgb-card-always space-y-6">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                    Preingreso del caso
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-zinc-50">Solicitud de reparación</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Déjanos la base del problema para orientar la recepción con más contexto.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
                  Respuesta por canales directos
                </div>
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
                  className="repair-input-surface min-h-32"
                  placeholder="Describe brevemente la falla, síntomas y cualquier detalle útil."
                />
              </label>

              <RepairInlineAlert tone="info" title="Canales activos">
                <p>
                  El envío desde el sitio sigue en preparación. Para abrir tu caso hoy, usa llamada o correo y comparte
                  estos mismos datos con el taller.
                </p>
              </RepairInlineAlert>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <button
                  type="button"
                  disabled
                  className="min-h-11 rounded-full border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm font-black text-zinc-500 disabled:cursor-not-allowed"
                >
                  Envío web en preparación
                </button>
                <RepairButton href="tel:+50600000000" tone="secondary" size="sm">
                  Llamar
                </RepairButton>
                <RepairButton href="mailto:contacto@fengzlab.local" tone="secondary" size="sm">
                  Correo
                </RepairButton>
              </div>
            </RepairPanel>
          </div>

          <aside className="space-y-5">
            <RepairPanel className="repair-rgb-card space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Contacto del taller</p>
              <div className="grid gap-3 text-sm">
                <Info label="Teléfono" value="+506 0000-0000" />
                <Info label="Correo" value="contacto@fengzlab.local" />
                <Info label="Horario" value="Lun - Vie: 09:00 - 17:00" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <RepairButton href="tel:+50600000000" tone="secondary" size="sm">
                  Llamar
                </RepairButton>
                <RepairButton href="mailto:contacto@fengzlab.local" tone="secondary" size="sm">
                  Correo
                </RepairButton>
              </div>
            </RepairPanel>

            <RepairPanel className="repair-rgb-card border-cyan-300/20 bg-cyan-500/10">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Después del ingreso</p>
              <h3 className="mt-3 text-xl font-black text-zinc-50">Seguimiento profesional</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Cuando tu caso entre al flujo del taller, recibirás trazabilidad clara por ticket, cotización y portal
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

function Input({ label }: { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-200">
      {label}
      <input className="repair-input-surface min-h-12" placeholder={label} />
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
