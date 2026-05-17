import { ProductType } from "@prisma/client";

import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";

import type { CreateCatalogItemInput, UpdateCatalogItemStatusInput } from "./catalog.schema";

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
        isActive: input.isActive,
        isPublic: input.isPublic,
      },
    });

    if (input.type !== ProductType.SERVICE) {
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

