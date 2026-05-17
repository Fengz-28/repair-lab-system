import { z } from "zod";

export const receptionReceiptSchema = z.object({
  receiptNumber: z.string().min(1),
  ticketNumber: z.string().min(1),
  customerName: z.string().min(1),
  deviceLabel: z.string().min(1),
  reportedIssue: z.string().min(1),
  physicalCondition: z.string().min(1),
  accessoriesReceived: z.string().optional(),
  receivedAt: z.date(),
});

export type ReceptionReceipt = z.infer<typeof receptionReceiptSchema>;

