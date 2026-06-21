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
    "DiagnÃ³stico electrÃ³nico",
    "RevisiÃ³n tÃ©cnica para identificar fallas, alcance y ruta de reparaciÃ³n.",
    "RevisiÃ³n",
  ],
  [
    "ReparaciÃ³n de consolas",
    "AtenciÃ³n a fallas comunes en energÃ­a, video, puertos, temperatura y almacenamiento.",
    "Gaming",
  ],
  ["Cambio HDMI", "Reemplazo y revisiÃ³n de puertos HDMI daÃ±ados o sin seÃ±al.", "Puertos"],
  ["Microsoldadura", "Trabajo de precisiÃ³n en conectores, pistas y componentes de placa.", "Nivel placa"],
  [
    "Mantenimiento preventivo",
    "Limpieza profunda, control tÃ©rmico y revisiÃ³n general del equipo.",
    "Preventivo",
  ],
  ["ReparaciÃ³n de controles", "Servicio para drift, botones, carga, flex y fallas de mandos.", "Accesorios"],
  [
    "Limpieza profunda",
    "Remocion de polvo, residuos y mantenimiento interno para equipos exigidos.",
    "Cuidado",
  ],
  [
    "Repuestos y reacondicionamiento",
    "PreparaciÃ³n de partes, equipos y componentes para uso o venta futura.",
    "CatÃ¡logo",
  ],
];

export default function ServicesPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Servicios"
        title="Servicios tÃ©cnicos para consolas, controles y electrÃ³nica de precisiÃ³n."
        description="FengzLab atiende diagnÃ³stico, reparaciÃ³n, mantenimiento y reacondicionamiento con seguimiento claro para cada caso."
        primaryHref="/contact"
        primaryLabel="Solicitar revisiÃ³n"
        secondaryHref="/products"
        secondaryLabel="Ver productos"
      />
      <RepairContainer className="space-y-12 py-16">
        <section className="space-y-6">
          <PublicSectionHeader
            eyebrow="Especialidades"
            title="Ãreas donde trabaja FengzLab"
            description="DiagnÃ³stico responsable, reparaciÃ³n documentada y trabajo tÃ©cnico orientado a equipos de alta rotaciÃ³n."
          />
          <ServicesHoverSlideshow />
        </section>

        <section className="space-y-6">
          <PublicSectionHeader
            eyebrow="Cobertura tecnica"
            title="Servicios pensados para reparar bien y comunicar mejor"
            description="Cada servicio estÃ¡ orientado a trazabilidad, aprobaciÃ³n clara y entrega profesional."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map(([title, description, badge]) => (
              <PublicServiceCard key={title} title={title} description={description} badge={badge} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <RepairPanel className="repair-rgb-card space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Contacto tÃ©cnico</p>
            <h3 className="text-2xl font-black text-zinc-50">Â¿Necesitas una revisiÃ³n personalizada?</h3>
            <p className="text-sm leading-6 text-zinc-300">
              Comparte tu caso y te ayudamos a definir el mejor camino de diagnÃ³stico y reparaciÃ³n para tu equipo.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <RepairButton href="/contact" tone="secondary" size="sm">
                Coordinar cita
              </RepairButton>
              <RepairButton href="mailto:contacto@fengzlab.tech" tone="secondary" size="sm">
                Correo
              </RepairButton>
            </div>
          </RepairPanel>

          <RepairPanel className="repair-rgb-card">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">AtenciÃ³n</p>
            <div className="mt-3 space-y-3 text-sm">
              <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-zinc-300">
                Horario: Lun - Vie de 09:00 a 17:00
              </p>
              <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-zinc-300">
                Correo: contacto@fengzlab.tech
              </p>
              <p className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-zinc-300">
                TelÃ©fono: Atencion por cita
              </p>
            </div>
          </RepairPanel>
        </section>
      </RepairContainer>
    </PublicShell>
  );
}
