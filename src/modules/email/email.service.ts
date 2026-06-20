import {
  CommunicationChannel,
  MessageDirection,
  MessageStatus,
  Prisma,
} from "@prisma/client";

import { getEmailConfig } from "@/server/email";

import { renderTransactionalEmail } from "./email.templates";
import type { TransactionalEmailRequest } from "./email.types";

type EmailDb = Prisma.TransactionClient;

export async function sendTransactionalEmailSafely(
  db: EmailDb,
  request: TransactionalEmailRequest,
) {
  const rendered = renderTransactionalEmail(request.template, request.data);
  const recipient = request.recipient.email ?? null;
  const emailConfig = getEmailConfig();
  const provider = emailConfig.provider;
  const baseMetadata = {
    template: request.template,
    htmlPreview: rendered.html,
    portalUrl: request.data.portalUrl ?? null,
    privacy: "No internal notes, audit logs, inventory details or private photos are included.",
  } satisfies Prisma.InputJsonObject;

  const messageLog = await db.messageLog.create({
    data: {
      customerId: request.recipient.customerId ?? null,
      ticketId: request.recipient.ticketId ?? null,
      channel: CommunicationChannel.EMAIL,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.QUEUED,
      provider,
      recipient,
      subject: rendered.subject,
      body: rendered.text,
      metadata: baseMetadata,
    },
  });

  if (!recipient) {
    await markMessage(db, messageLog.id, MessageStatus.DRAFT, provider, {
      ...baseMetadata,
      skipped: true,
      reason: "Customer email is not available.",
    });
    return messageLog;
  }

  await db.integrationEvent.create({
    data: {
      type: "notification.email.requested",
      aggregateType: "MessageLog",
      aggregateId: messageLog.id,
      idempotencyKey: `notification.email.requested:${messageLog.id}`,
      payload: {
        messageLogId: messageLog.id,
        template: request.template,
        provider,
        customerId: request.recipient.customerId ?? null,
        ticketId: request.recipient.ticketId ?? null,
      },
    },
  });

  return messageLog;
}

export function buildPublicPortalUrl(publicAccessToken: string) {
  return `${getAppBaseUrl()}/track/${encodeURIComponent(publicAccessToken)}`;
}

export function buildPublicQuotePdfUrl(publicAccessToken: string) {
  return `${buildPublicPortalUrl(publicAccessToken)}/quote.pdf`;
}

export function buildPublicInvoicePdfUrl(publicAccessToken: string) {
  return `${buildPublicPortalUrl(publicAccessToken)}/invoice.pdf`;
}

function getAppBaseUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return baseUrl.replace(/\/+$/, "");
}

async function markMessage(
  db: EmailDb,
  id: string,
  status: MessageStatus,
  provider: string,
  metadata: Prisma.InputJsonValue | null,
) {
  await db.messageLog.update({
    where: { id },
    data: {
      status,
      provider,
      providerMessageId: null,
      sentAt: undefined,
      metadata: metadata ?? undefined,
    },
  });
}
