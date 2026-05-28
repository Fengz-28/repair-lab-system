import { AdminNav } from "@/components/admin-nav";
import {
  RepairContainer,
  RepairGrid,
  RepairPageHero,
  RepairPageShell,
  RepairSkeletonCard,
} from "@/components/repairlab";

export default function InvoiceLoading() {
  return (
    <RepairPageShell>
      <AdminNav />
      <RepairPageHero
        eyebrow="Admin / Factura"
        title="Cargando factura"
        description="Preparando resumen financiero, líneas, historial de pagos y acciones."
      />
      <RepairContainer className="space-y-6 py-8">
        <RepairSkeletonCard />
        <RepairGrid className="gap-6 lg:grid-cols-[1fr_380px]">
          <RepairGrid className="gap-4">
            <RepairSkeletonCard />
            <RepairSkeletonCard />
          </RepairGrid>
          <RepairSkeletonCard />
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
  );
}
