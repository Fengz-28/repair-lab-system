import "server-only";

import { MessageStatus, TicketStatus } from "@prisma/client";

import type { NotificationCenterItem } from "@/modules/ux/components/notifications-center";
import { prisma } from "@/server/db/prisma";

const openTicketStatuses = [
  TicketStatus.RECEIVED,
  TicketStatus.INITIAL_REVIEW,
  TicketStatus.DIAGNOSIS,
  TicketStatus.WAITING_APPROVAL,
  TicketStatus.APPROVED,
  TicketStatus.REPAIR_IN_PROGRESS,
  TicketStatus.READY_FOR_PICKUP,
];

export async function getAdminNotificationItems(): Promise<NotificationCenterItem[]> {
  const [
    lowStockCount,
    failedMessagesCount,
    queuedMessagesCount,
    waitingApprovalCount,
    urgentTicketsCount,
  ] = await Promise.all([
    prisma.catalogItem.count({
      where: {
        trackInventory: true,
        inventoryItem: {
          is: {
            quantityOnHand: {
              lte: prisma.inventoryItem.fields.reorderLevel,
            },
          },
        },
      },
    }),
    prisma.messageLog.count({
      where: { status: MessageStatus.FAILED },
    }),
    prisma.messageLog.count({
      where: { status: MessageStatus.QUEUED },
    }),
    prisma.ticket.count({
      where: { status: TicketStatus.WAITING_APPROVAL },
    }),
    prisma.ticket.count({
      where: {
        priority: { gte: 2 },
        status: { in: openTicketStatuses },
      },
    }),
  ]);

  const items: Array<NotificationCenterItem | null> = [
    lowStockCount > 0
      ? {
          id: "low-stock",
          title: "Stock bajo",
          description: `${lowStockCount} item(s) estan en o por debajo del minimo.`,
          href: "/admin/catalog",
          severity: "warning",
          count: lowStockCount,
        }
      : null,
    failedMessagesCount > 0
      ? {
          id: "failed-messages",
          title: "Mensajes fallidos",
          description: `${failedMessagesCount} mensaje(s) requieren revisión.`,
          href: "/admin/messages?status=FAILED",
          severity: "error",
          count: failedMessagesCount,
        }
      : null,
    queuedMessagesCount > 0
      ? {
          id: "queued-messages",
          title: "Mensajes pendientes",
          description: `${queuedMessagesCount} mensaje(s) estan en cola.`,
          href: "/admin/messages?status=QUEUED",
          severity: "info",
          count: queuedMessagesCount,
        }
      : null,
    urgentTicketsCount > 0
      ? {
          id: "urgent-tickets",
          title: "Tickets urgentes",
          description: `${urgentTicketsCount} ticket(s) abiertos con prioridad alta.`,
          href: "/admin/tickets?status=open",
          severity: "error",
          count: urgentTicketsCount,
        }
      : null,
    waitingApprovalCount > 0
      ? {
          id: "waiting-approval",
          title: "Esperando aprobación",
          description: `${waitingApprovalCount} ticket(s) esperan respuesta del cliente.`,
          href: "/admin/tickets?status=waiting_approval",
          severity: "warning",
          count: waitingApprovalCount,
        }
      : null,
  ];

  return items.filter((item): item is NotificationCenterItem => Boolean(item));
}
