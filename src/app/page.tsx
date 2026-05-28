import {
  PublicHero,
  PublicSectionHeader,
  PublicServiceCard,
  PublicShell,
} from "@/components/repairlab/public-site";
import { RepairButton, RepairContainer, RepairPanel } from "@/components/repairlab";

const featuredServices = [
  {
    title: "Reparación de consolas",
    badge: "Gaming",
    description: "Diagnóstico y reparación para consolas con fallas de video, energía, puertos, temperatura o controles.",
  },
  {
    title: "Microsoldadura",
    badge: "Board level",
    description: "Trabajo técnico en conectores, pistas, componentes pequeños y reparaciones electrónicas de precisión.",
  },
  {
    title: "Diagnóstico electrónico",
    badge: "Revision",
    description: "Evaluación inicial para identificar causa probable, alcance de reparación y ruta de cotización.",
  },
  {
    title: "Mantenimiento",
    badge: "Preventivo",
    description: "Limpieza profunda, cambio de pasta térmica y revisión para mejorar estabilidad y temperatura.",
  },
  {
    title: "Reparación de controles",
    badge: "Accesorios",
    description: "Atencion a drift, botones, conectores, carga, flex y fallas comunes de mandos.",
  },
  {
    title: "Equipos reacondicionados",
    badge: "Catálogo",
    description: "Preparación y revisión de equipos para venta futura con historial y control interno.",
  },
];

const processSteps = ["Recibimos equipo", "Diagnostico", "Cotizacion", "Reparacion", "Entrega"];

export default function HomePage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="RepairLab / Electronic repair"
        title="Reparación electrónica con seguimiento claro y documentado."
        description="Un taller moderno para recibir equipos, diagnosticar fallas, cotizar reparaciones y mantener al cliente informado con transparencia."
        primaryHref="/contact"
        primaryLabel="Solicitar reparación"
        secondaryHref="/services"
        secondaryLabel="Ver servicios"
        badge="Portal de seguimiento preparado para clientes"
      />

      <RepairContainer className="space-y-16 py-16">
        <section className="space-y-8">
          <PublicSectionHeader
            eyebrow="Servicios destacados"
            title="Soporte técnico para electrónica real"
            description="Servicios pensados para consolas, controles, placas, repuestos y equipos que necesitan diagnóstico profesional."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((service) => (
              <PublicServiceCard key={service.title} {...service} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <PublicSectionHeader
            eyebrow="Proceso"
            title="Un flujo simple, trazable y profesional"
            description="Desde la recepción hasta la entrega, cada etapa queda preparada para seguimiento interno y comunicación clara."
          />
          <div className="grid gap-4 md:grid-cols-5">
            {processSteps.map((step, index) => (
              <RepairPanel key={step} className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-base font-black text-zinc-950 dark:text-zinc-50">{step}</h3>
              </RepairPanel>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-4">
          {[
            ["Seguimiento por portal", "El cliente puede revisar el estado de su reparación con un enlace seguro."],
            ["PDFs profesionales", "Cotizaciones y facturas internas listas para descargar e imprimir."],
            ["Historial tecnico", "Cada ticket conserva eventos, estados y actividad relevante."],
            ["Transparencia", "Cotizaciones, pagos y saldos se mantienen claros durante el proceso."],
          ].map(([title, description]) => (
            <RepairPanel key={title}>
              <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
            </RepairPanel>
          ))}
        </section>

        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/35">
          <h2 className="text-3xl font-black text-zinc-950 dark:text-zinc-50">¿Tienes un equipo para revisar?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Agenda una recepción o consulta el proceso para que podamos evaluar tu equipo con orden y trazabilidad.
          </p>
          <div className="mt-6">
            <RepairButton href="/contact">Solicitar reparación</RepairButton>
          </div>
        </section>
      </RepairContainer>
    </PublicShell>
  );
}
