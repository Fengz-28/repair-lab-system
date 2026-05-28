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

export default function TicketDetailLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Ticket"
        title="Cargando ticket"
        description="Preparando línea de tiempo, cliente, equipo, finanzas y acciones operativas."
      />
      <RepairContainer className="py-8 sm:py-10">
        <RepairGrid className="gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(320px,4fr)]">
          <section className="space-y-6">
            <RepairPanel>
              <RepairSkeleton className="h-5 w-48" />
              <RepairSkeleton className="mt-4 h-14 w-full" />
            </RepairPanel>
            <RepairSkeletonCard />
            <RepairGrid className="gap-6 xl:grid-cols-2">
              <RepairSkeletonCard />
              <RepairSkeletonCard />
            </RepairGrid>
            <RepairSkeletonCard />
          </section>
          <aside className="space-y-4">
            <RepairSkeletonCard />
            <RepairSkeletonCard />
            <RepairSkeletonCard />
          </aside>
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
