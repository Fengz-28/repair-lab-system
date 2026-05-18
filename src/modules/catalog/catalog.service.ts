import { ProductType } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";

import type {
  CreateCatalogItemInput,
  UpdateCatalogInventoryTrackingInput,
  UpdateCatalogItemStatusInput,
} from "./catalog.schema";

type CatalogOptions = {
  actorUserId?: string | null;
};

export async function createCatalogItem(
  input: CreateCatalogItemInput,
  options: CatalogOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.catalogItem.create({
      data: {
        type: input.type,
        sku: input.sku,
        name: input.name,
        description: input.description,
        category: input.category,
        basePrice: input.basePrice,
        costPrice: input.type === ProductType.SERVICE ? null : input.costPrice,
        priceStartsAt: input.priceStartsAt,
        estimatedDurationMinutes:
          input.type === ProductType.SERVICE ? input.estimatedDurationMinutes : null,
        trackInventory: input.type === ProductType.SERVICE ? false : input.trackInventory,
        isActive: input.isActive,
        isPublic: input.isPublic,
      },
    });

    if (input.type !== ProductType.SERVICE && input.trackInventory) {
      const quantityOnHand = input.initialStock ?? 0;

      const inventoryItem = await tx.inventoryItem.create({
        data: {
          catalogItemId: item.id,
          quantityOnHand,
          reorderLevel: input.reorderLevel ?? 0,
          location: input.location,
        },
      });

      if (quantityOnHand > 0) {
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: "IN",
            quantity: quantityOnHand,
            reason: "Initial stock on catalog item creation.",
            referenceType: "CatalogItem",
            referenceId: item.id,
            notes: "Stock inicial registrado al crear item de catalogo.",
          },
        });
      }
    }

    const eventType = input.type === ProductType.SERVICE ? "service.created" : "product.created";

    await tx.integrationEvent.create({
      data: {
        type: eventType,
        aggregateType: "CatalogItem",
        aggregateId: item.id,
        payload: {
          catalogItemId: item.id,
          type: item.type,
          name: item.name,
          category: item.category,
          placeholder: true,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: eventType,
      entityType: "CatalogItem",
      entityId: item.id,
      after: {
        type: item.type,
        sku: item.sku,
        name: item.name,
        category: item.category,
        basePrice: item.basePrice?.toString() ?? null,
        costPrice: item.costPrice?.toString() ?? null,
        priceStartsAt: item.priceStartsAt,
        estimatedDurationMinutes: item.estimatedDurationMinutes,
        trackInventory: item.trackInventory,
        isActive: item.isActive,
        isPublic: item.isPublic,
      },
      metadata: {
        module: "catalog",
      },
    });

    return item;
  });
}

export async function updateCatalogInventoryTracking(
  input: UpdateCatalogInventoryTrackingInput,
  options: CatalogOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.catalogItem.findUnique({
      where: { id: input.catalogItemId },
      include: {
        inventoryItem: true,
      },
    });

    if (!item) {
      throw new Error("Item de catalogo no encontrado.");
    }

    if (item.type === ProductType.SERVICE && input.trackInventory) {
      throw new Error("Los servicios no controlan inventario.");
    }

    const updatedItem = await tx.catalogItem.update({
      where: { id: item.id },
      data: {
        trackInventory: item.type === ProductType.SERVICE ? false : input.trackInventory,
      },
    });

    let inventoryItem = item.inventoryItem;

    if (input.trackInventory && item.type !== ProductType.SERVICE && !inventoryItem) {
      const quantityOnHand = input.initialStock ?? 0;

      inventoryItem = await tx.inventoryItem.create({
        data: {
          catalogItemId: item.id,
          quantityOnHand,
          reorderLevel: input.reorderLevel ?? 0,
          location: input.location,
        },
      });

      if (quantityOnHand > 0) {
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: "IN",
            quantity: quantityOnHand,
            reason: "Stock inicial al activar control de inventario.",
            referenceType: "CatalogItem",
            referenceId: item.id,
            notes: "Control de inventario activado manualmente.",
          },
        });
      }
    } else if (inventoryItem) {
      inventoryItem = await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: {
          reorderLevel: input.reorderLevel ?? inventoryItem.reorderLevel,
          location: input.location ?? inventoryItem.location,
        },
      });
    }

    await tx.integrationEvent.create({
      data: {
        type: "inventory.tracking_updated",
        aggregateType: "CatalogItem",
        aggregateId: item.id,
        payload: {
          catalogItemId: item.id,
          trackInventory: updatedItem.trackInventory,
          inventoryItemId: inventoryItem?.id ?? null,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "inventory.tracking_updated",
      entityType: "CatalogItem",
      entityId: item.id,
      before: {
        trackInventory: item.trackInventory,
        reorderLevel: item.inventoryItem?.reorderLevel ?? null,
        location: item.inventoryItem?.location ?? null,
      },
      after: {
        trackInventory: updatedItem.trackInventory,
        reorderLevel: inventoryItem?.reorderLevel ?? null,
        location: inventoryItem?.location ?? null,
      },
      metadata: {
        module: "inventory",
      },
    });

    return updatedItem;
  });
}

export async function updateCatalogItemStatus(
  input: UpdateCatalogItemStatusInput,
  options: CatalogOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.catalogItem.findUnique({
      where: { id: input.catalogItemId },
    });

    if (!item) {
      throw new Error("Catalog item not found.");
    }

    const updatedItem = await tx.catalogItem.update({
      where: { id: item.id },
      data: {
        isActive: input.isActive,
      },
    });

    const eventType = item.type === ProductType.SERVICE ? "service.updated" : "product.updated";

    await tx.integrationEvent.create({
      data: {
        type: eventType,
        aggregateType: "CatalogItem",
        aggregateId: item.id,
        payload: {
          catalogItemId: item.id,
          type: item.type,
          isActive: updatedItem.isActive,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: eventType,
      entityType: "CatalogItem",
      entityId: item.id,
      before: {
        isActive: item.isActive,
      },
      after: {
        isActive: updatedItem.isActive,
      },
      metadata: {
        module: "catalog",
      },
    });

    return updatedItem;
  });
}
