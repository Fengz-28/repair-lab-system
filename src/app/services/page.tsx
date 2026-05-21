import {
  PublicHero,
  PublicSectionHeader,
  PublicServiceCard,
  PublicShell,
} from "@/components/repairlab/public-site";
import { RepairContainer } from "@/components/repairlab";

const services = [
  ["Diagnostico electronico", "Revision tecnica para identificar fallas, alcance y ruta de reparacion.", "Revision"],
  ["Reparacion de consolas", "Atencion a fallas comunes en energia, video, puertos, temperatura y almacenamiento.", "Gaming"],
  ["Cambio HDMI", "Reemplazo y revision de puertos HDMI danados o sin senal.", "Puertos"],
  ["Microsoldadura", "Trabajo de precision en conectores, pistas y componentes de placa.", "Board level"],
  ["Mantenimiento preventivo", "Limpieza profunda, control termico y revision general del equipo.", "Preventivo"],
  ["Reparacion de controles", "Servicio para drift, botones, carga, flex y fallas de mandos.", "Accesorios"],
  ["Limpieza profunda", "Remocion de polvo, residuos y mantenimiento interno para equipos exigidos.", "Cuidado"],
  ["Repuestos y reacondicionamiento", "Preparacion de partes, equipos y componentes para uso o venta futura.", "Catalogo"],
];

export default function ServicesPage() {
  return (
    <PublicShell>
      <PublicHero
        eyebrow="Servicios"
        title="Servicios tecnicos para equipos electronicos."
        description="Catalogo inicial de servicios para diagnostico, reparacion, mantenimiento y reacondicionamiento."
        primaryHref="/contact"
        secondaryHref="/products"
        secondaryLabel="Ver productos"
      />
      <RepairContainer className="space-y-10 py-16">
        <PublicSectionHeader
          eyebrow="Catalogo de servicios"
          title="Especialidades RepairLab"
          description="Servicios pensados para operar con cotizacion previa y seguimiento claro."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map(([title, description, badge]) => (
            <PublicServiceCard key={title} title={title} description={description} badge={badge} />
          ))}
        </div>
      </RepairContainer>
    </PublicShell>
  );
}
