"use server";

import { Prisma, type MessageStatus, type TicketStatus } from "@prisma/client";

import { customerName, ticketStatusLabel } from "@/modules/customers/customer-labels";
import { messageStatusLabel } from "@/modules/messages/message-labels";
import { prisma } from "@/server/db/prisma";
import { requireLocalStaff } from "@/server/auth/local-admin";

const MIN_QUERY_LENGTH = 2;
const CATEGORY_LIMIT = 5;

export type GlobalSearchCategory = "tickets" | "customers" | "messages";

export type GlobalSearchResult = {
  id: string;
  category: GlobalSearchCategory;
  label: string;
  description: string;
  href: string;
  meta?: string;
};

export type GlobalSearchResponse = {
  query: string;
  results: Record<GlobalSearchCategory, GlobalSearchResult[]>;
  total: number;
};

export async function globalSearch(rawQuery: string): Promise<GlobalSearchResponse> {
  await requireLocalStaff();

  const query = rawQuery.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return emptyResponse(query);
  }

  const ticketStatusFilter = ticketStatusQuery(query);
  const messageStatusFilter = messageStatusQuery(query);
  const ticketWhere: Prisma.TicketWhereInput[] = [
    { id: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { ticketNumber: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { reportedIssue: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { customer: { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { customer: { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { device: { brand: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { device: { model: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { device: { serial: { contains: query, mode: Prisma.QueryMode.insensitive } } },
  ];
  const messageWhere: Prisma.MessageLogWhereInput[] = [
    { recipient: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { subject: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { body: { contains: query, mode: Prisma.QueryMode.insensitive } },
    { ticket: { ticketNumber: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { customer: { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { customer: { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } } },
    { customer: { email: { contains: query, mode: Prisma.QueryMode.insensitive } } },
  ];

  if (ticketStatusFilter) {
    ticketWhere.push({ status: ticketStatusFilter });
  }

  if (messageStatusFilter) {
    messageWhere.push({ status: messageStatusFilter });
  }

  const [tickets, customers, messages] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        OR: ticketWhere,
      },
      orderBy: { updatedAt: "desc" },
      take: CATEGORY_LIMIT,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        reportedIssue: true,
        status: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        device: {
          select: {
            brand: true,
            model: true,
            serial: true,
          },
        },
      },
    }),
    prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { whatsappPhone: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: CATEGORY_LIMIT,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        whatsappPhone: true,
      },
    }),
    prisma.messageLog.findMany({
      where: {
        OR: messageWhere,
      },
      orderBy: { createdAt: "desc" },
      take: CATEGORY_LIMIT,
      select: {
        id: true,
        recipient: true,
        subject: true,
        body: true,
        status: true,
        provider: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ticket: {
          select: {
            ticketNumber: true,
          },
        },
      },
    }),
  ]);

  const results = {
    tickets: tickets.map((ticket) => {
      const deviceLabel = [ticket.device.brand, ticket.device.model].filter(Boolean).join(" ");
      const serial = ticket.device.serial ? ` - Serial ${ticket.device.serial}` : "";

      return {
        id: ticket.id,
        category: "tickets" as const,
        label: `${ticket.ticketNumber} - ${ticket.title}`,
        description: `${customerName(ticket.customer)} - ${deviceLabel}${serial}`,
        href: `/admin/tickets/${ticket.id}`,
        meta: ticketStatusLabel(ticket.status),
      };
    }),
    customers: customers.map((customer) => ({
      id: customer.id,
      category: "customers" as const,
      label: customerName(customer),
      description: customer.email ?? customer.whatsappPhone ?? customer.phone ?? "Sin contacto registrado",
      href: `/admin/customers/${customer.id}`,
      meta: "Cliente",
    })),
    messages: messages.map((message) => {
      const owner = message.customer
        ? customerName(message.customer)
        : message.recipient ?? "Sin destinatario";

      return {
        id: message.id,
        category: "messages" as const,
        label: message.subject ?? "Mensaje sin asunto",
        description: compactText(`${owner}${message.ticket ? ` - ${message.ticket.ticketNumber}` : ""}`),
        href: `/admin/messages/${message.id}`,
        meta: messageStatusLabel(message.status, message.provider),
      };
    }),
  };

  return {
    query,
    results,
    total: results.tickets.length + results.customers.length + results.messages.length,
  };
}

function emptyResponse(query: string): GlobalSearchResponse {
  return {
    query,
    results: {
      tickets: [],
      customers: [],
      messages: [],
    },
    total: 0,
  };
}

function ticketStatusQuery(query: string) {
  const normalized = normalize(query);
  const match = Object.values(ticketStatusLabels).find(([status, label]) => {
    return normalize(status).includes(normalized) || normalize(label).includes(normalized);
  });

  return match ? { equals: match[0] as TicketStatus } : undefined;
}

function messageStatusQuery(query: string) {
  const normalized = normalize(query);
  const match = Object.values(messageStatusLabels).find(([status, label]) => {
    return normalize(status).includes(normalized) || normalize(label).includes(normalized);
  });

  return match ? { equals: match[0] as MessageStatus } : undefined;
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

const ticketStatusLabels = {
  RECEIVED: ["RECEIVED", "Recibido"],
  INITIAL_REVIEW: ["INITIAL_REVIEW", "Revision inicial"],
  DIAGNOSIS: ["DIAGNOSIS", "En diagnóstico"],
  WAITING_APPROVAL: ["WAITING_APPROVAL", "Esperando aprobación"],
  APPROVED: ["APPROVED", "Listo para reparación"],
  REPAIR_IN_PROGRESS: ["REPAIR_IN_PROGRESS", "En reparación"],
  READY_FOR_PICKUP: ["READY_FOR_PICKUP", "Listo para entrega"],
  DELIVERED: ["DELIVERED", "Entregado"],
  CANCELLED: ["CANCELLED", "Cancelado"],
} as const;

const messageStatusLabels = {
  DRAFT: ["DRAFT", "Borrador"],
  QUEUED: ["QUEUED", "Pendiente"],
  SENT: ["SENT", "Enviado"],
  DELIVERED: ["DELIVERED", "Entregado"],
  FAILED: ["FAILED", "Fallido"],
  RECEIVED: ["RECEIVED", "Recibido"],
} as const;
