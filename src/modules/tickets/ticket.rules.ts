import { TicketStatus } from "@prisma/client";

export const ticketStatusTransitions: Record<TicketStatus, TicketStatus[]> = {
  RECEIVED: [TicketStatus.INITIAL_REVIEW],
  INITIAL_REVIEW: [TicketStatus.DIAGNOSIS],
  DIAGNOSIS: [TicketStatus.WAITING_APPROVAL],
  WAITING_APPROVAL: [TicketStatus.APPROVED, TicketStatus.CANCELLED],
  APPROVED: [TicketStatus.REPAIR_IN_PROGRESS],
  REPAIR_IN_PROGRESS: [TicketStatus.READY_FOR_PICKUP],
  READY_FOR_PICKUP: [TicketStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

export const finalTicketStatuses = new Set<TicketStatus>([
  TicketStatus.DELIVERED,
  TicketStatus.CANCELLED,
]);

export function getAllowedNextStatuses(status: TicketStatus) {
  return ticketStatusTransitions[status] ?? [];
}

export function canTransitionTicketStatus(from: TicketStatus, to: TicketStatus) {
  return getAllowedNextStatuses(from).includes(to);
}

export function assertCanTransitionTicketStatus(from: TicketStatus, to: TicketStatus) {
  if (!canTransitionTicketStatus(from, to)) {
    throw new Error(`Invalid ticket transition: ${from} -> ${to}.`);
  }
}
