import type { TicketStatus } from "@prisma/client";

type RepairBadgeTone = "neutral" | "emerald" | "cyan" | "warning" | "danger" | "violet";

export const ticketStatusLabels: Record<TicketStatus, string> = {
  RECEIVED: "Recibido",
  INITIAL_REVIEW: "Revisión inicial",
  DIAGNOSIS: "En diagnóstico",
  WAITING_APPROVAL: "Esperando aprobación",
  APPROVED: "Aprobado / listo para reparación",
  REPAIR_IN_PROGRESS: "En reparación",
  READY_FOR_PICKUP: "Listo para entrega",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ticketStatusTones: Record<TicketStatus, RepairBadgeTone> = {
  RECEIVED: "cyan",
  INITIAL_REVIEW: "cyan",
  DIAGNOSIS: "warning",
  WAITING_APPROVAL: "violet",
  APPROVED: "emerald",
  REPAIR_IN_PROGRESS: "cyan",
  READY_FOR_PICKUP: "violet",
  DELIVERED: "emerald",
  CANCELLED: "danger",
};

export function getTicketStatusLabel(status: TicketStatus) {
  return ticketStatusLabels[status] ?? status;
}

export function getTicketStatusTone(status: TicketStatus) {
  return ticketStatusTones[status] ?? "neutral";
}
