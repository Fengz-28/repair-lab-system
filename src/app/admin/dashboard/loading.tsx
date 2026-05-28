import { AdminNav, DemoChecklist } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairPanel,
  RepairSkeleton,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function AdminDashboardLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Dashboard"
        title="Panel operativo del taller"
        description="Cargando resumen operativo, pagos, saldos e inventario."
      />

      <RepairContainer className="space-y-8 py-8 sm:py-10">
        <RepairGrid className="md:grid-cols-2 xl:grid-cols-4">
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>

        <DemoChecklist />

        <RepairGrid className="gap-6 xl:grid-cols-2">
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
          <LoadingPanel />
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}

function LoadingPanel() {
  return (
    <RepairPanel>
      <RepairSkeleton className="h-5 w-40" />
      <div className="mt-5 grid gap-3">
        <RepairSkeleton className="h-12 w-full" />
        <RepairSkeleton className="h-12 w-full" />
        <RepairSkeleton className="h-12 w-4/5" />
      </div>
    </RepairPanel>
  );
}
