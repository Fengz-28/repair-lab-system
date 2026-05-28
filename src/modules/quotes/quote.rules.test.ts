import { InvoiceStatus, TicketStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { canTransitionQuoteStatus } from "./quote.lifecycle";
import {
  assertQuoteCanMoveToStatusFromSnapshot,
  ticketStatusForQuoteStatus,
} from "./quote.rules";

describe("quote rules", () => {
  it("allows the expected quote lifecycle transitions", () => {
    expect(canTransitionQuoteStatus(InvoiceStatus.DRAFT, InvoiceStatus.SENT)).toBe(true);
    expect(canTransitionQuoteStatus(InvoiceStatus.SENT, InvoiceStatus.APPROVED)).toBe(true);
    expect(canTransitionQuoteStatus(InvoiceStatus.SENT, InvoiceStatus.REJECTED)).toBe(true);
    expect(canTransitionQuoteStatus(InvoiceStatus.SENT, InvoiceStatus.EXPIRED)).toBe(true);
    expect(canTransitionQuoteStatus(InvoiceStatus.APPROVED, InvoiceStatus.REJECTED)).toBe(false);
  });

  it("does not allow sending or approving empty quotes", () => {
    expect(() =>
      assertQuoteCanMoveToStatusFromSnapshot({
        itemCount: 0,
        total: 100,
        nextStatus: InvoiceStatus.SENT,
      }),
    ).toThrow("No se puede enviar una cotización sin líneas.");

    expect(() =>
      assertQuoteCanMoveToStatusFromSnapshot({
        itemCount: 0,
        total: 100,
        nextStatus: InvoiceStatus.APPROVED,
      }),
    ).toThrow("No se puede aprobar una cotización sin líneas.");
  });

  it("does not allow sending or approving quotes with zero total", () => {
    expect(() =>
      assertQuoteCanMoveToStatusFromSnapshot({
        itemCount: 1,
        total: 0,
        nextStatus: InvoiceStatus.SENT,
      }),
    ).toThrow("No se puede enviar una cotización con total cero.");

    expect(() =>
      assertQuoteCanMoveToStatusFromSnapshot({
        itemCount: 1,
        total: 0,
        nextStatus: InvoiceStatus.APPROVED,
      }),
    ).toThrow("No se puede aprobar una cotización con total cero.");
  });

  it("maps quote status changes to ticket status changes", () => {
    expect(ticketStatusForQuoteStatus(InvoiceStatus.SENT, TicketStatus.DIAGNOSIS)).toBe(
      TicketStatus.WAITING_APPROVAL,
    );
    expect(ticketStatusForQuoteStatus(InvoiceStatus.APPROVED, TicketStatus.WAITING_APPROVAL)).toBe(
      TicketStatus.APPROVED,
    );
    expect(ticketStatusForQuoteStatus(InvoiceStatus.REJECTED, TicketStatus.WAITING_APPROVAL)).toBe(
      TicketStatus.DIAGNOSIS,
    );
    expect(ticketStatusForQuoteStatus(InvoiceStatus.EXPIRED, TicketStatus.WAITING_APPROVAL)).toBe(
      TicketStatus.DIAGNOSIS,
    );
  });
});
