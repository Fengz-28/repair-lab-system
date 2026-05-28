import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairPanel,
  RepairSkeleton,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function AdminTicketsLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Tickets"
        title="Tickets de reparación"
        description="Cargando tickets, filtros y acciones operativas."
      />

      <RepairContainer className="space-y-6 py-8 sm:space-y-8 sm:py-10">
        <RepairPanel>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_160px_auto]">
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-32" />
          </div>
        </RepairPanel>

        <RepairGrid className="xl:grid-cols-2">
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
