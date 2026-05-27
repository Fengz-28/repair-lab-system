import { AdminNav } from "@/components/admin-nav";
import { InventoryHero } from "@/components/repairlab/inventory-hero";
import { InventoryStatsGrid } from "@/components/repairlab/inventory-stats-grid";
import { LowStockAlertPanel } from "@/components/repairlab/low-stock-alert-panel";
import { RepairContainer } from "@/components/repairlab";
import { formatMoney } from "@/modules/customers/customer-labels";
import { CatalogAdmin } from "@/modules/catalog/components/catalog-admin";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  await requireLocalStaff();

  const items = await prisma.catalogItem.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      inventoryItem: {
        include: {
          movements: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  const catalogItems = items.map((item) => ({
    id: item.id,
    type: item.type,
    sku: item.sku,
    name: item.name,
    description: item.description,
    category: item.category,
    basePrice: item.basePrice?.toString() ?? null,
    costPrice: item.costPrice?.toString() ?? null,
    priceStartsAt: item.priceStartsAt,
    estimatedDurationMinutes: item.estimatedDurationMinutes,
    trackInventory: item.trackInventory,
    isActive: item.isActive,
    isPublic: item.isPublic,
    inventoryItem: item.inventoryItem
      ? {
          id: item.inventoryItem.id,
          quantityOnHand: item.inventoryItem.quantityOnHand,
          reorderLevel: item.inventoryItem.reorderLevel,
          location: item.inventoryItem.location,
          movements: item.inventoryItem.movements.map((movement) => ({
            id: movement.id,
            type: movement.type,
            quantity: movement.quantity,
            reason: movement.reason,
            referenceType: movement.referenceType,
            referenceId: movement.referenceId,
            notes: movement.notes,
            createdAt: movement.createdAt.toLocaleString("es-CR"),
          })),
        }
      : null,
  }));
  const lowStockItems = items
    .filter(
      (item) =>
        item.trackInventory &&
        item.inventoryItem &&
        item.inventoryItem.quantityOnHand <= item.inventoryItem.reorderLevel,
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantityOnHand: item.inventoryItem?.quantityOnHand ?? 0,
      reorderLevel: item.inventoryItem?.reorderLevel ?? 0,
    }));
  const stats = {
    totalItems: items.length,
    trackedItems: items.filter((item) => item.trackInventory).length,
    lowStockItems: lowStockItems.length,
    outOfStockItems: items.filter(
      (item) => item.trackInventory && item.inventoryItem && item.inventoryItem.quantityOnHand <= 0,
    ).length,
    estimatedValue: formatMoney(
      items.reduce((total, item) => {
        const quantity = item.inventoryItem?.quantityOnHand ?? 0;
        const unitCost = Number(item.costPrice ?? 0);
        return total + quantity * unitCost;
      }, 0),
    ),
    recentMovements: items.reduce((total, item) => total + (item.inventoryItem?.movements.length ?? 0), 0),
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <AdminNav />
      <InventoryHero stats={stats} />

      <RepairContainer className="space-y-6 py-8">
        <InventoryStatsGrid {...stats} />
        <LowStockAlertPanel items={lowStockItems} />
        <CatalogAdmin items={catalogItems} />
      </RepairContainer>
    </main>
  );
}
