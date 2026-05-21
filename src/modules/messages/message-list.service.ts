import { MessageStatus, Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

import { parseMessageMetadata } from "./message-metadata";

export type MessageListSearchParams = {
  search?: string;
  status?: string;
  provider?: string;
  template?: string;
  recent?: string;
};

export async function getMessageListData(params: MessageListSearchParams) {
  const search = params.search?.trim() ?? "";
  const status = parseStatus(params.status);
  const provider = params.provider?.trim() || "";
  const template = params.template?.trim() || "";
  const recent = params.recent === "7d" || params.recent === "30d" ? params.recent : "";
  const createdAt = recent ? { gte: recentDate(recent) } : undefined;

  const where: Prisma.MessageLogWhereInput = {
    ...(status ? { status } : {}),
    ...(provider ? { provider } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(template
      ? {
          metadata: {
            path: ["template"],
            equals: template,
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { recipient: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } },
            { ticket: { ticketNumber: { contains: search, mode: "insensitive" } } },
            { customer: { firstName: { contains: search, mode: "insensitive" } } },
            { customer: { lastName: { contains: search, mode: "insensitive" } } },
            { customer: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const messages = await prisma.messageLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      customer: true,
      ticket: {
        select: {
          id: true,
          ticketNumber: true,
          publicAccessToken: true,
        },
      },
    },
  });

  return {
    filters: {
      search,
      status: status ?? "",
      provider,
      template,
      recent,
    },
    messages: messages.map((message) => {
      const metadata = parseMessageMetadata(message.metadata);

      return {
        id: message.id,
        createdAt: message.createdAt,
        recipient: message.recipient,
        subject: message.subject,
        provider: message.provider,
        status: message.status,
        template: metadata.template,
        error: metadata.error,
        reason: metadata.reason,
        customerName: message.customer
          ? `${message.customer.firstName} ${message.customer.lastName ?? ""}`.trim()
          : null,
        ticket: message.ticket,
      };
    }),
  };
}

function parseStatus(value?: string) {
  if (!value || !Object.values(MessageStatus).includes(value as MessageStatus)) {
    return null;
  }

  return value as MessageStatus;
}

function recentDate(value: "7d" | "30d") {
  const date = new Date();
  date.setDate(date.getDate() - (value === "7d" ? 7 : 30));
  return date;
}
