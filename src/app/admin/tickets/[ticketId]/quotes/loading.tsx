import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function QuotesLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Cotizaciones"
        title="Cargando cotizaciones"
        description="Preparando propuestas, lineas, totales y acciones comerciales."
      />
      <RepairContainer className="space-y-6 py-8">
        <RepairSkeletonCard />
        <RepairSkeletonCard />
        <RepairGrid className="xl:grid-cols-2">
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
