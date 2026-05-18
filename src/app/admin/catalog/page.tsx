import { CatalogAdmin } from "@/modules/catalog/components/catalog-admin";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  await requireLocalStaff();

  const items = await prisma.catalogItem.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      inventoryItem: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Admin / Catalogo</p>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Servicios, productos e inventario basico
        </h1>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
          Base comercial para cotizaciones, invoices, web publica futura e inventario. Sin
          ecommerce, pagos ni integraciones externas.
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
          isActive: item.isActive,
          isPublic: item.isPublic,
          inventoryItem: item.inventoryItem
            ? {
                id: item.inventoryItem.id,
                quantityOnHand: item.inventoryItem.quantityOnHand,
                reorderLevel: item.inventoryItem.reorderLevel,
                location: item.inventoryItem.location,
              }
            : null,
        }))}
      />
    </main>
  );
}
