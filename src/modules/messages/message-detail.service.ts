import { prisma } from "@/server/db/prisma";

import { parseMessageMetadata } from "./message-metadata";

export async function getMessageDetailData(messageId: string) {
  const message = await prisma.messageLog.findUnique({
    where: { id: messageId },
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

  if (!message) {
    return null;
  }

  const metadata = parseMessageMetadata(message.metadata);

  return {
    id: message.id,
    channel: message.channel,
    direction: message.direction,
    status: message.status,
    provider: message.provider,
    providerMessageId: message.providerMessageId,
    recipient: message.recipient,
    subject: message.subject,
    body: message.body,
    createdAt: message.createdAt,
    sentAt: message.sentAt,
    metadata,
    customer: message.customer
      ? {
          name: `${message.customer.firstName} ${message.customer.lastName ?? ""}`.trim(),
          email: message.customer.email,
        }
      : null,
    ticket: message.ticket,
  };
}
