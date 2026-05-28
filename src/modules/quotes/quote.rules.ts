import { InvoiceStatus, TicketStatus } from "@prisma/client";

export function assertQuoteCanMoveToStatusFromSnapshot(input: {
  itemCount: number;
  total: number;
  nextStatus: InvoiceStatus;
}) {
  if (input.nextStatus !== InvoiceStatus.SENT && input.nextStatus !== InvoiceStatus.APPROVED) {
    return;
  }

  if (input.itemCount === 0) {
    if (input.nextStatus === InvoiceStatus.SENT) {
      throw new Error("No se puede enviar una cotización sin líneas.");
    }

    throw new Error("No se puede aprobar una cotización sin líneas.");
  }

  if (input.nextStatus === InvoiceStatus.SENT && input.total <= 0) {
    throw new Error("No se puede enviar una cotización con total cero.");
  }

  if (input.nextStatus === InvoiceStatus.APPROVED && input.total <= 0) {
    throw new Error("No se puede aprobar una cotización con total cero.");
  }
}

export function ticketStatusForQuoteStatus(
  quoteStatus: InvoiceStatus,
  currentTicketStatus: TicketStatus,
) {
  if (quoteStatus === InvoiceStatus.SENT && currentTicketStatus === TicketStatus.DIAGNOSIS) {
    return TicketStatus.WAITING_APPROVAL;
  }

  if (
    quoteStatus === InvoiceStatus.APPROVED &&
    currentTicketStatus === TicketStatus.WAITING_APPROVAL
  ) {
    return TicketStatus.APPROVED;
  }

  if (
    (quoteStatus === InvoiceStatus.REJECTED || quoteStatus === InvoiceStatus.EXPIRED) &&
    currentTicketStatus === TicketStatus.WAITING_APPROVAL
  ) {
    return TicketStatus.DIAGNOSIS;
  }

  return null;
}
