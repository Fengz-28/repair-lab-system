import { InvoiceStatus } from "@prisma/client";

export const quoteStatusTransitions: Partial<Record<InvoiceStatus, InvoiceStatus[]>> = {
  DRAFT: [InvoiceStatus.SENT, InvoiceStatus.EXPIRED],
  SENT: [InvoiceStatus.APPROVED, InvoiceStatus.REJECTED, InvoiceStatus.EXPIRED],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
};

export function getAllowedQuoteStatuses(status: InvoiceStatus) {
  return quoteStatusTransitions[status] ?? [];
}

export function canTransitionQuoteStatus(from: InvoiceStatus, to: InvoiceStatus) {
  return getAllowedQuoteStatuses(from).includes(to);
}

