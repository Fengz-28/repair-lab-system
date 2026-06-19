import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function CustomerDetailLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="CRM / Cliente"
        title="Cargando cliente"
        description="Preparando historial técnico, equipos, saldos y actividad reciente."
      />
      <RepairContainer className="-mt-8 relative z-10 pb-12">
        <RepairGrid className="gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <RepairGrid className="min-w-0 gap-6">
            <RepairSkeletonCard />
            <RepairSkeletonCard />
            <RepairSkeletonCard />
          </RepairGrid>
          <aside className="space-y-5">
            <RepairSkeletonCard />
            <RepairSkeletonCard />
            <RepairSkeletonCard />
          </aside>
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
