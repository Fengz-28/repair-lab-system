import { RepairButton, RepairContainer, RepairPanel } from "@/components/repairlab";
import { ServicesHoverSlideshow } from "@/components/repairlab/services-hover-slideshow";
import {
  PublicHero,
  PublicSectionHeader,
  PublicServiceCard,
  PublicShell,
} from "@/components/repairlab/public-site";

const services = [
  [
    "Diagnóstico electrónico",
    "Revisión técnica para identificar fallas, alcance y ruta de reparación.",
    "Revisión",
  ],
  [
    "Reparación de consolas",
    "Atención a fallas comunes en energía, video, puertos, temperatura y almacenamiento.",
    "Gaming",
  ],
  ["Cambio HDMI", "Reemplazo y revisión de puertos HDMI dañados o sin señal.", "Puertos"],
  ["Microsoldadura", "Trabajo de precisión en conectores, pistas y componentes de placa.", "Nivel placa"],
  [
    "Mantenimiento preventivo",
    "Limpieza profunda, control térmico y revisión general del equipo.",
    "Preventivo",
  ],
  ["Reparación de controles", "Servicio para drift, botones, carga, flex y fallas de mandos.", "Accesorios"],
  [
    "Limpieza profunda",
    "Remocion de polvo, residuos y mantenimiento interno para equipos exigidos.",
    "Cuidado",
  ],
  [
    "Repuestos y reacondicionamiento",
    "Preparación de partes, equipos y componentes para uso o venta futura.",
    "Catálogo",
  ],
];

export default function ServicesPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Servicios"
        title="Servicios técnicos para consolas, controles y electrónica de precisión."
        description="FengzLab atiende diagnóstico, reparación, mantenimiento y reacondicionamiento con seguimiento claro para cada caso."
        primaryHref="/contact"
        primaryLabel="Solicitar revisión"
        secondaryHref="/products"
        secondaryLabel="Ver productos"
      />
      <RepairContainer className="space-y-12 py-16">
        <section className="space-y-6">
          <PublicSectionHeader
            eyebrow="Especialidades"
            title="Áreas donde trabaja FengzLab"
            description="Diagnóstico responsable, reparación documentada y trabajo técnico orientado a equipos de alta rotación."
          />
          <ServicesHoverSlideshow />
        </section>

        <section className="space-y-6">
          <PublicSectionHeader
            eyebrow="Cobertura tecnica"
            title="Servicios pensados para reparar bien y comunicar mejor"
            description="Cada servicio está orientado a trazabilidad, aprobación clara y entrega profesional."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map(([title, description, badge]) => (
              <PublicServiceCard key={title} title={title} description={description} badge={badge} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <RepairPanel className="repair-rgb-card space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Contacto técnico</p>
            <h3 className="text-2xl font-black text-zinc-50">¿Necesitas una revisión personalizada?</h3>
            <p className="text-sm leading-6 text-zinc-300">
              Comparte tu caso y te ayudamos a definir el mejor camino de diagnóstico y reparación para tu equipo.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <RepairButton href="tel:+50600000000" tone="secondary" size="sm">
                Llamar
              </RepairButton>
              <RepairButton href="mailto:contacto@fengzlab.local" tone="secondary" size="sm">
                Correo
              </RepairButton>
            </div>
          </RepairPanel>

          <RepairPanel className="repair-rgb-card">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">Atención</p>
            <div className="mt-3 space-y-3 text-sm">
              <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-zinc-300">
                Horario: Lun - Vie de 09:00 a 17:00
              </p>
              <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-zinc-300">
                Correo: contacto@fengzlab.local
              </p>
              <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-zinc-300">
                Teléfono: +506 0000-0000
              </p>
            </div>
          </RepairPanel>
        </section>
      </RepairContainer>
    </PublicShell>
  );
}
