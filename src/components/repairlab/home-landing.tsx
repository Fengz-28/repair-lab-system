"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  ClipboardList,
  Clock3,
  Cpu,
  FileSpreadsheet,
  FileText,
  Gamepad2,
  Microscope,
  PackageCheck,
  PackageSearch,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

import { RepairButton, RepairContainer, RepairPanel, RepairSection } from "@/components/repairlab";
import FlowFieldBackground from "@/components/ui/flow-field-background";
import RetroGrid from "@/components/ui/retro-grid";

const services = [
  {
    title: "Reparación de consolas",
    description: "Fallas de video, energía, puertos y temperatura con trazabilidad completa.",
    icon: Swords,
  },
  {
    title: "Diagnóstico electrónico",
    description: "Revisión técnica para definir alcance, tiempo y costo de reparación.",
    icon: Microscope,
  },
  {
    title: "Microsoldadura",
    description: "Trabajo de precisión en pistas, conectores y componentes de placa.",
    icon: Wrench,
  },
  {
    title: "Reparación de controles",
    description: "Drift, botones, carga y conexiones en mandos de alta rotación.",
    icon: Target,
  },
  {
    title: "Repuestos y reacondicionamiento",
    description: "Inventario funcional para acelerar reparaciones y entregas.",
    icon: PackageSearch,
  },
  {
    title: "Cotización y factura",
    description: "Documentación clara para aprobación, pago y entrega final.",
    icon: FileSpreadsheet,
  },
];

const workflow = [
  { label: "Recepción", description: "Ingreso con datos y evidencia del equipo.", icon: ClipboardList },
  { label: "Diagnóstico", description: "Revisión técnica y definición de alcance.", icon: SearchCheck },
  { label: "Cotización", description: "Propuesta clara para aprobación del cliente.", icon: FileText },
  { label: "Reparación", description: "Intervención técnica con control de calidad.", icon: Wrench },
  { label: "Entrega", description: "Cierre ordenado y seguimiento post-servicio.", icon: PackageCheck },
];

const pillars = [
  {
    title: "Operación sin caos",
    description: "Cada ticket sigue un flujo claro para que el taller avance con orden diario.",
    icon: Zap,
  },
  {
    title: "Confianza del cliente",
    description: "Portal, documentos y estados visibles mejoran comunicación y transparencia.",
    icon: ShieldCheck,
  },
  {
    title: "Rentabilidad real",
    description: "Tiempos, pagos y repuestos conectados para tomar mejores decisiones de negocio.",
    icon: BadgeDollarSign,
  },
];

export function HomeLanding() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 text-white fengz-deep-blue-bg">
        <div className="pointer-events-none absolute inset-0 hidden opacity-22 md:block">
          <RetroGrid className="h-full w-full" gridColor="#22d3ee" showScanlines glowEffect disableOnMobile />
        </div>
        <div className="fengz-shader-beams hidden opacity-70 md:block" />
        <div className="fengz-shader-vignette opacity-85" />
        <RepairContainer className="relative z-10 py-16 sm:py-22">
          <div className="max-w-[72rem]">
            <div>
              <Link
                href="/services"
                className="repair-focus-ring group inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-md transition hover:border-cyan-300/35 hover:bg-cyan-500/8 hover:text-cyan-100"
              >
                <Trophy className="size-3.5 text-cyan-300" />
                <span>Fengz Lab / Reparación electrónica avanzada</span>
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Fengz Lab / Taller técnico en Costa Rica
            </p>

            <h1 className="fengz-esports-display mt-4 max-w-[13ch] text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-[4.6rem] lg:leading-[0.95]">
              Reparación electrónica premium con precisión y trazabilidad real.
            </h1>

            <p className="mt-6 max-w-[44rem] text-sm leading-7 text-zinc-300 sm:text-base">
              En Fengz Lab trabajamos con proceso profesional de principio a fin: recepción, diagnóstico,
              cotización, reparación y entrega. Menos incertidumbre, más control y mejor experiencia para el
              cliente.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <RepairButton href="/contact">Solicitar reparación</RepairButton>
              <RepairButton href="/services" tone="secondary">
                Ver servicios
              </RepairButton>
            </div>

            <div className="mt-10 grid gap-3 md:max-w-5xl md:grid-cols-3">
              <QuickSignal
                icon={BadgeDollarSign}
                title="Cotización transparente"
                description="Precios y alcance definidos antes de reparar."
              />
              <QuickSignal
                icon={ShieldCheck}
                title="Seguimiento profesional"
                description="Portal y estados visibles para generar confianza."
              />
              <QuickSignal
                icon={Microscope}
                title="Diagnóstico técnico"
                description="Revisión responsable antes de intervenir el equipo."
              />
            </div>
          </div>
        </RepairContainer>
      </section>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
          <FlowFieldBackground className="h-full w-full" color="#7079ff" particleCount={560} speed={0.85} trailOpacity={0.13} />
        </div>
        <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(1,3,12,0.34),rgba(0,0,0,0.8))]" />
        <div className="fengz-shader-vignette z-0 opacity-70" />
        <RepairContainer className="relative z-10 space-y-18 py-18">
          <RepairSection className="space-y-6">
            <SectionHeader
              eyebrow="Proceso"
              title="Operación técnica con velocidad y control"
              description="Atención profesional para diagnosticar, cotizar y reparar con seguimiento claro para cada cliente."
            />
            <BentoGridShowcase
              integration={<BentoIntegrationCard />}
              trackers={<BentoStat icon={Activity} label="Recepción" value="Ingreso ordenado" />}
              statistic={<BentoStat icon={Clock3} label="Diagnóstico" value="Tiempos claros" />}
              focus={<BentoStat icon={Workflow} label="Aprobación" value="Cotización visible" />}
              productivity={<BentoStat icon={Boxes} label="Ejecución" value="Reparación trazable" />}
              shortcuts={<BentoFooterCard />}
            />
          </RepairSection>

          <RepairSection className="space-y-6">
            <SectionHeader
              eyebrow="Ventaja"
              title="Branding potente, servicio serio"
              description="Estética esports premium con foco en lo importante: reparar bien, comunicar mejor y ganar confianza."
            />
            <div className="grid gap-5 lg:grid-cols-3">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge rounded-xl p-5 shadow-sm shadow-black/30"
                >
                  <pillar.icon className="size-5 text-cyan-300" />
                  <h3 className="mt-3 text-xl font-black text-zinc-50">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{pillar.description}</p>
                </article>
              ))}
            </div>
          </RepairSection>

          <RepairSection className="space-y-6">
            <SectionHeader
              eyebrow="Servicios"
              title="Especialidades para equipos electrónicos de alta rotación"
              description="Cobertura real para consolas, controles, placas, diagnóstico y mantenimiento técnico."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge rounded-xl p-5 shadow-sm shadow-black/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <service.icon className="size-5 text-cyan-300" />
                    <span className="rounded-full border border-cyan-300/35 bg-cyan-500/15 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-cyan-100">
                      Servicio
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-black text-zinc-50">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{service.description}</p>
                  <Link
                    href="/services"
                    className="mt-4 inline-flex text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                  >
                    Ver detalle
                  </Link>
                </article>
              ))}
            </div>
          </RepairSection>

          <RepairSection className="space-y-6">
            <SectionHeader
              eyebrow="Flujo"
              title="Flujo técnico visible para cada cliente"
              description="Cada paso comunica orden, avance y control profesional."
            />
            <div className="grid gap-4 lg:grid-cols-5">
              {workflow.map((item) => (
                <div key={item.label}>
                  <RepairPanel className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge rounded-xl text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-cyan-300/35 bg-cyan-500/20 text-cyan-100">
                      <item.icon className="size-5" />
                    </div>
                    <p className="mt-3 text-[0.62rem] font-black uppercase tracking-[0.14em] text-cyan-300">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-zinc-200">{item.description}</p>
                  </RepairPanel>
                </div>
              ))}
            </div>
          </RepairSection>

        <section className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge-static rounded-xl p-7 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Contacto</p>
              <h2 className="mt-3 text-3xl font-black text-zinc-50 sm:text-4xl">
                Agenda tu revisión con Fengz Lab.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                Si ocupas reparar consola, control o placa electrónica, te atendemos con proceso profesional,
                cotización clara y seguimiento real.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <RepairButton href="/contact">Iniciar solicitud</RepairButton>
              <RepairButton href="/products" tone="secondary">
                Ver catálogo
              </RepairButton>
            </div>
          </div>
        </section>
      </RepairContainer>
      </section>
    </>
  );
}

function BentoGridShowcase({
  integration,
  trackers,
  statistic,
  focus,
  productivity,
  shortcuts,
}: {
  integration: ReactNode;
  trackers: ReactNode;
  statistic: ReactNode;
  focus: ReactNode;
  productivity: ReactNode;
  shortcuts: ReactNode;
}) {
  return (
    <section className="grid w-full auto-rows-[minmax(180px,auto)] grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-3">
      <div className="md:col-span-1 md:row-span-3">
        {integration}
      </div>
      <div className="md:col-span-1 md:row-span-1">
        {trackers}
      </div>
      <div className="md:col-span-1 md:row-span-1">
        {statistic}
      </div>
      <div className="md:col-span-1 md:row-span-1">
        {focus}
      </div>
      <div className="md:col-span-1 md:row-span-1">
        {productivity}
      </div>
      <div className="md:col-span-2 md:row-span-1">
        {shortcuts}
      </div>
    </section>
  );
}

function BentoIntegrationCard() {
  return (
    <div className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge-static h-full rounded-2xl p-6">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Núcleo del taller</p>
      <h3 className="mt-3 text-2xl font-black text-zinc-50 sm:text-3xl">
        Un solo flujo para recibir, diagnosticar y entregar bien.
      </h3>
      <p className="mt-4 text-sm leading-6 text-zinc-300">
        Cada caso se trabaja con orden, evidencia y comunicación clara para que el cliente sepa exactamente en qué va
        su reparación.
      </p>
      <div className="mt-6 grid gap-3">
        <BentoChip icon={Gamepad2} label="Consolas y controles" />
        <BentoChip icon={Cpu} label="Microsoldadura y electrónica avanzada" />
        <BentoChip icon={ShieldAlert} label="Diagnóstico responsable" />
      </div>
    </div>
  );
}

function BentoStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge h-full rounded-2xl p-5">
      <Icon className="size-5 text-cyan-300" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-zinc-50">{value}</p>
    </div>
  );
}

function BentoFooterCard() {
  return (
    <div className="fengz-carbon-panel fengz-carbon-panel-aggressive fengz-rgb-edge rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Siguiente paso</p>
          <h4 className="mt-2 text-xl font-black text-zinc-50">Agenda tu revisión y recibe una ruta de reparación clara.</h4>
        </div>
        <RepairButton href="/contact" tone="secondary" size="sm">
          Solicitar reparación
        </RepairButton>
      </div>
    </div>
  );
}

function BentoChip({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2">
      <Icon className="size-4 text-cyan-300" />
      <span className="text-sm font-semibold text-zinc-200">{label}</span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-zinc-300">{description}</p>
    </div>
  );
}

function QuickSignal({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-black/28 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
      <div className="grid size-8 place-items-center rounded-xl border border-cyan-300/18 bg-cyan-500/[0.08] text-cyan-300">
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-base font-black tracking-tight text-zinc-100">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

