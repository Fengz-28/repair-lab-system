import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const registerManualPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive().max(999999999.99),
  method: z.enum(PaymentMethod),
  reference: z.preprocess(emptyToUndefined, z.string().max(250).optional()),
  notes: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
});

export type RegisterManualPaymentInput = z.infer<typeof registerManualPaymentSchema>;
