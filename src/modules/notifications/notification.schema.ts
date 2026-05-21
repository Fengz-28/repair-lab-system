import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();

export const notificationRecipientSchema = z.object({
  customerId: z.string().min(1).optional(),
  ticketId: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const ticketEmailTemplateSchema = z.object({
  customerName: z.string().min(1),
  ticketNumber: z.string().min(1),
  deviceLabel: z.string().min(1),
  reportedIssue: optionalText,
  receiptNumber: optionalText,
  fromStatus: optionalText,
  toStatus: optionalText,
});

export const quoteEmailTemplateSchema = z.object({
  customerName: z.string().min(1),
  ticketNumber: z.string().min(1),
  quoteNumber: z.string().min(1),
  total: z.string().min(1),
  currency: z.string().min(1),
});

export const notificationRequestSchema = z.object({
  template: z.enum([
    "intake.received",
    "ticket.status_changed",
    "quote.sent",
    "quote.approved",
    "ticket.ready_for_pickup",
    "ticket.delivered",
  ]),
  recipient: notificationRecipientSchema,
  data: z.record(z.string(), z.unknown()),
});

export type NotificationTemplate = z.infer<typeof notificationRequestSchema>["template"];
export type NotificationRequest = z.infer<typeof notificationRequestSchema>;
