import { InvoiceStatus, ProductType } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const money = z.coerce.number().nonnegative().max(999999999.99);

export const createQuoteSchema = z.object({
  ticketId: z.string().min(1),
  customerNotes: z.preprocess(emptyToUndefined, z.string().max(3000).optional()),
  internalNotes: z.preprocess(emptyToUndefined, z.string().max(3000).optional()),
  expiresInDays: z.coerce.number().int().min(1).max(90).default(15),
});

export const addQuoteItemSchema = z.object({
  quoteId: z.string().min(1),
  catalogItemId: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  itemType: z.enum(ProductType),
  description: z.preprocess(emptyToUndefined, z.string().min(1).max(500)),
  quantity: z.coerce.number().int().min(1).max(1000),
  unitPrice: z.preprocess(emptyToUndefined, money.optional()),
});

export const changeQuoteStatusSchema = z.object({
  quoteId: z.string().min(1),
  nextStatus: z.enum([
    InvoiceStatus.SENT,
    InvoiceStatus.APPROVED,
    InvoiceStatus.REJECTED,
    InvoiceStatus.EXPIRED,
  ]),
  internalComment: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type AddQuoteItemInput = z.infer<typeof addQuoteItemSchema>;
export type ChangeQuoteStatusInput = z.infer<typeof changeQuoteStatusSchema>;
