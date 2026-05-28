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

export default function MessagesLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Comunicaciones"
        title="Cargando mensajes"
        description="Preparando historial de notificaciones, filtros y estados de envio."
      />
      <RepairContainer className="space-y-6 py-8">
        <RepairPanel>
          <div className="grid gap-3 xl:grid-cols-[1fr_170px_170px_190px_150px_auto]">
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-full" />
            <RepairSkeleton className="h-12 w-28" />
          </div>
        </RepairPanel>
        <RepairGrid>
          <RepairSkeletonCard />
          <RepairSkeletonCard />
          <RepairSkeletonCard />
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
