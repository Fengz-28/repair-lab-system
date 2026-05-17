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
  quantityDelta: z.coerce.number().int().min(-1000000).max(1000000),
  reason: z.preprocess(emptyToUndefined, z.string().min(1).max(500)),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;

