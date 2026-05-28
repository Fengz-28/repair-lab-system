import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function MessageDetailLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Mensaje"
        title="Cargando mensaje"
        description="Preparando metadatos, estado, ticket asociado y contenido seguro."
      />
      <RepairContainer className="space-y-6 py-8">
        <RepairGrid className="sm:grid-cols-2 lg:grid-cols-3">
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>
        <RepairSkeletonCard />
        <RepairSkeletonCard />
      </RepairContainer>
    </RepairPageShell>
  );
}
