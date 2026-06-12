import { RepairContainer } from "@/components/repairlab";
import { PublicProductsCatalog } from "@/components/repairlab/public-products-catalog";
import {
  PublicHero,
  PublicSectionHeader,
  PublicShell,
} from "@/components/repairlab/public-site";

export default function ProductsPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Productos"
        title="Repuestos, accesorios y equipos por consulta."
        description="FengzLab muestra inventario referencial para ayudarte a validar disponibilidad, opciones y estado antes de coordinar una compra o reparacion."
        primaryHref="/contact"
        primaryLabel="Consultar disponibilidad"
        secondaryHref="/services"
        secondaryLabel="Ver servicios"
      />
      <RepairContainer className="space-y-10 py-16">
        <PublicSectionHeader
          eyebrow="Catalogo"
          title="Productos y repuestos seleccionados para el taller"
          description="Esta seccion muestra disponibilidad referencial y opciones frecuentes. La confirmacion final se coordina directamente con FengzLab."
        />
        <PublicProductsCatalog />
      </RepairContainer>
    </PublicShell>
  );
}
