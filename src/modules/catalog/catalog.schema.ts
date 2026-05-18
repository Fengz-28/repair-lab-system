import { ProductType } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalMoney = z.preprocess(
  emptyToUndefined,
  z.coerce.number().nonnegative().max(999999999.99).optional(),
);

const optionalInt = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().nonnegative().max(1000000).optional(),
);

export const createCatalogItemSchema = z.object({
  type: z.enum(ProductType),
  sku: z.preprocess(emptyToUndefined, z.string().max(80).optional()),
  name: z.preprocess(emptyToUndefined, z.string().min(1).max(160)),
  description: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  category: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
  basePrice: optionalMoney,
  costPrice: optionalMoney,
  priceStartsAt: z.coerce.boolean().default(false),
  estimatedDurationMinutes: optionalInt,
  trackInventory: z.coerce.boolean().default(false),
  initialStock: optionalInt,
  reorderLevel: optionalInt,
  location: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  isActive: z.coerce.boolean().default(true),
  isPublic: z.coerce.boolean().default(false),
});

export const updateCatalogItemStatusSchema = z.object({
  catalogItemId: z.string().min(1),
  isActive: z.coerce.boolean(),
});

export const updateCatalogInventoryTrackingSchema = z.object({
  catalogItemId: z.string().min(1),
  trackInventory: z.coerce.boolean(),
  initialStock: optionalInt,
  reorderLevel: optionalInt,
  location: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
});

export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemStatusInput = z.infer<typeof updateCatalogItemStatusSchema>;
export type UpdateCatalogInventoryTrackingInput = z.infer<typeof updateCatalogInventoryTrackingSchema>;
