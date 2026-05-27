import { TicketStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  assertCanTransitionTicketStatus,
  canTransitionTicketStatus,
  finalTicketStatuses,
  getAllowedNextStatuses,
} from "./ticket.rules";

describe("ticket status rules", () => {
  it("allows the expected operational path", () => {
    expect(canTransitionTicketStatus(TicketStatus.RECEIVED, TicketStatus.INITIAL_REVIEW)).toBe(true);
    expect(canTransitionTicketStatus(TicketStatus.INITIAL_REVIEW, TicketStatus.DIAGNOSIS)).toBe(true);
    expect(canTransitionTicketStatus(TicketStatus.DIAGNOSIS, TicketStatus.WAITING_APPROVAL)).toBe(true);
    expect(canTransitionTicketStatus(TicketStatus.WAITING_APPROVAL, TicketStatus.APPROVED)).toBe(true);
    expect(canTransitionTicketStatus(TicketStatus.APPROVED, TicketStatus.REPAIR_IN_PROGRESS)).toBe(true);
    expect(canTransitionTicketStatus(TicketStatus.REPAIR_IN_PROGRESS, TicketStatus.READY_FOR_PICKUP)).toBe(true);
    expect(canTransitionTicketStatus(TicketStatus.READY_FOR_PICKUP, TicketStatus.DELIVERED)).toBe(true);
  });

  it("treats delivered and cancelled as final states", () => {
    expect(finalTicketStatuses.has(TicketStatus.DELIVERED)).toBe(true);
    expect(finalTicketStatuses.has(TicketStatus.CANCELLED)).toBe(true);
    expect(getAllowedNextStatuses(TicketStatus.DELIVERED)).toEqual([]);
    expect(getAllowedNextStatuses(TicketStatus.CANCELLED)).toEqual([]);
  });

  it("rejects invalid transitions with a clear error", () => {
    expect(canTransitionTicketStatus(TicketStatus.RECEIVED, TicketStatus.DIAGNOSIS)).toBe(false);
    expect(() =>
      assertCanTransitionTicketStatus(TicketStatus.RECEIVED, TicketStatus.DIAGNOSIS),
    ).toThrow("Invalid ticket transition: RECEIVED -> DIAGNOSIS.");
  });
});
