import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function CatalogLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Inventario"
        title="Cargando catalogo"
        description="Preparando productos, repuestos, stock, alertas y movimientos recientes."
      />
      <RepairContainer className="space-y-6 py-8">
        <RepairGrid className="md:grid-cols-2 xl:grid-cols-4">
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>
        <RepairSkeletonCard />
        <RepairGrid className="gap-5 xl:grid-cols-2">
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
