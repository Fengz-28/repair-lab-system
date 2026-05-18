import { InventoryMovementType } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const adjustInventorySchema = z.object({
  inventoryItemId: z.string().min(1),
  type: z.enum([
    InventoryMovementType.IN,
    InventoryMovementType.OUT,
    InventoryMovementType.ADJUSTMENT,
  ]),
  quantity: z.coerce.number().int().positive().max(1000000),
  reason: z.preprocess(emptyToUndefined, z.string().min(1).max(500)),
  notes: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
