import { z } from "zod";

export const convertQuoteToInvoiceSchema = z.object({
  quoteId: z.string().min(1),
});

export type ConvertQuoteToInvoiceInput = z.infer<typeof convertQuoteToInvoiceSchema>;
