import { AdminNav } from "@/components/admin-nav";
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

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <AdminNav />
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Admin / Catalogo</p>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Servicios, productos e inventario basico
        </h1>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
          Administra servicios, repuestos, productos e inventario del taller.
        </p>
      </header>

      <CatalogAdmin
        items={items.map((item) => ({
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
        }))}
      />
    </main>
  );
}
