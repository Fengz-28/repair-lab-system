import { writeAuditLog } from "@/server/audit/audit.service";
import { prisma } from "@/server/db/prisma";

import { calculateInventoryQuantity } from "./inventory.rules";
import type { AdjustInventoryInput } from "./inventory.schema";

type InventoryOptions = {
  actorUserId?: string | null;
};

export async function adjustInventory(
  input: AdjustInventoryInput,
  options: InventoryOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const inventoryItem = await tx.inventoryItem.findUnique({
      where: { id: input.inventoryItemId },
      include: {
        catalogItem: true,
      },
    });

    if (!inventoryItem) {
      throw new Error("Inventory item not found.");
    }

    const nextQuantity = calculateInventoryQuantity({
      currentQuantity: inventoryItem.quantityOnHand,
      movementType: input.type,
      quantity: input.quantity,
    });

    const updatedInventoryItem = await tx.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantityOnHand: nextQuantity,
      },
    });

    const movement = await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventoryItem.id,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        referenceType: "ManualAdjustment",
        referenceId: inventoryItem.catalogItemId,
        notes: input.notes,
      },
    });

    await tx.integrationEvent.create({
      data: {
        type: "inventory.adjusted",
        aggregateType: "InventoryItem",
        aggregateId: inventoryItem.id,
        payload: {
          inventoryItemId: inventoryItem.id,
          catalogItemId: inventoryItem.catalogItemId,
          quantityBefore: inventoryItem.quantityOnHand,
          quantityAfter: updatedInventoryItem.quantityOnHand,
          movementType: input.type,
          quantity: input.quantity,
          movementId: movement.id,
        },
      },
    });

    await writeAuditLog(tx, {
      actorUserId: options.actorUserId ?? null,
      action: "inventory.adjusted",
      entityType: "InventoryItem",
      entityId: inventoryItem.id,
      before: {
        quantityOnHand: inventoryItem.quantityOnHand,
      },
      after: {
        quantityOnHand: updatedInventoryItem.quantityOnHand,
      },
      metadata: {
        module: "inventory",
        catalogItemId: inventoryItem.catalogItemId,
        catalogItemName: inventoryItem.catalogItem.name,
        movementId: movement.id,
        reason: input.reason,
        movementType: input.type,
        quantity: input.quantity,
      },
    });

    return updatedInventoryItem;
  });
}
