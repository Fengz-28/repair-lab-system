import type { Prisma } from "@prisma/client";

export type EmailTemplateKey =
  | "intake.received"
  | "ticket.status_changed"
  | "quote.sent"
  | "quote.approved"
  | "ticket.ready_for_pickup"
  | "ticket.delivered";

export type EmailRecipient = {
  customerId?: string;
  ticketId?: string;
  email?: string;
};

export type TransactionalEmailRequest = {
  template: EmailTemplateKey;
  recipient: EmailRecipient;
  data: Record<string, unknown>;
};

export type RenderedTransactionalEmail = {
  subject: string;
  text: string;
  html: string;
};

export type EmailSendResult = {
  provider: string;
  providerMessageId?: string;
  metadata?: Prisma.InputJsonValue;
};
