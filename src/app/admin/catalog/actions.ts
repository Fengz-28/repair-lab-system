"use server";

import { revalidatePath } from "next/cache";

import { requireLocalStaff } from "@/server/auth/local-admin";
import type { CatalogActionState } from "@/modules/catalog/catalog.action-state";
import {
  createCatalogItemSchema,
  updateCatalogItemStatusSchema,
} from "@/modules/catalog/catalog.schema";
import { createCatalogItem, updateCatalogItemStatus } from "@/modules/catalog/catalog.service";
import { adjustInventorySchema } from "@/modules/inventory/inventory.schema";
import { adjustInventory } from "@/modules/inventory/inventory.service";

export async function createCatalogItemAction(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const session = await requireLocalStaff();

  const parsed = createCatalogItemSchema.safeParse({
    type: formData.get("type") || "SERVICE",
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    basePrice: formData.get("basePrice"),
    costPrice: formData.get("costPrice"),
    priceStartsAt: formData.get("priceStartsAt") === "on",
    estimatedDurationMinutes: formData.get("estimatedDurationMinutes"),
    initialStock: formData.get("initialStock"),
    reorderLevel: formData.get("reorderLevel"),
    location: formData.get("location"),
    isActive: formData.get("isActive") === "on",
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos del item de catalogo.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createCatalogItem(parsed.data, {
      actorUserId: session.userId,
    });
    revalidatePath("/admin/catalog");

    return {
      ok: true,
      message: "Item de catalogo creado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo crear el item.",
    };
  }
}

export async function updateCatalogItemStatusAction(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const session = await requireLocalStaff();

  const parsed = updateCatalogItemStatusSchema.safeParse({
    catalogItemId: formData.get("catalogItemId"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "No se pudo actualizar el estado.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCatalogItemStatus(parsed.data, {
      actorUserId: session.userId,
    });
    revalidatePath("/admin/catalog");

    return {
      ok: true,
      message: "Estado actualizado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo actualizar.",
    };
  }
}

export async function adjustInventoryAction(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const session = await requireLocalStaff();

  const parsed = adjustInventorySchema.safeParse({
    inventoryItemId: formData.get("inventoryItemId"),
    quantityDelta: formData.get("quantityDelta"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa el ajuste de inventario.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await adjustInventory(parsed.data, {
      actorUserId: session.userId,
    });
    revalidatePath("/admin/catalog");

    return {
      ok: true,
      message: "Inventario ajustado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo ajustar inventario.",
    };
  }
}

