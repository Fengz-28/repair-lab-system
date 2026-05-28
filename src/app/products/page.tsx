import { PublicHero, PublicSectionHeader, PublicShell } from "@/components/repairlab/public-site";
import { RepairBadge, RepairButton, RepairContainer, RepairPanel } from "@/components/repairlab";

const products = [
  ["Consolas reacondicionadas", "Equipos revisados internamente para futura venta controlada.", "Consultar"],
  ["Controles", "Mandos y accesorios preparados para diagnóstico o venta futura.", "Próximamente"],
  ["Accesorios", "Cables, fuentes, cargadores y piezas de uso frecuente.", "Consultar"],
  ["Repuestos", "Partes y componentes para reparaciones controladas.", "Consultar"],
  ["Equipos unicos", "Inventario especial sujeto a disponibilidad real del taller.", "Proximamente"],
];

export default function ProductsPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Productos"
        title="Catálogo visual preparado para futura tienda."
        description="Una primera vitrina para productos, repuestos y equipos reacondicionados. Sin carrito ni comercio electrónico activo todavía."
        primaryHref="/contact"
        primaryLabel="Consultar disponibilidad"
        secondaryHref="/services"
        secondaryLabel="Ver servicios"
      />
      <RepairContainer className="space-y-10 py-16">
        <PublicSectionHeader
          eyebrow="Catálogo visual"
          title="Productos y repuestos"
          description="Estos items son una vitrina inicial. La venta online se implementara en una etapa futura."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map(([name, description, badge]) => (
            <RepairPanel key={name} className="transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-950/10 dark:hover:border-emerald-800">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  PR
                </div>
                <RepairBadge tone={badge === "Proximamente" ? "violet" : "emerald"}>{badge}</RepairBadge>
              </div>
              <h2 className="mt-5 text-xl font-black text-zinc-950 dark:text-zinc-50">{name}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
              <p className="mt-4 text-2xl font-black text-zinc-950 dark:text-zinc-50">Precio a consultar</p>
              <div className="mt-5">
                <RepairButton href="/contact" tone="secondary" size="sm">Consultar</RepairButton>
              </div>
            </RepairPanel>
          ))}
        </div>
      </RepairContainer>
    </PublicShell>
  );
}
