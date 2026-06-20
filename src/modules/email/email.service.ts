import {
  CommunicationChannel,
  MessageDirection,
  MessageStatus,
  Prisma,
} from "@prisma/client";

import { getEmailConfig, sendEmail } from "@/server/email";

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

  try {
    if (!recipient) {
      await markMessage(db, messageLog.id, MessageStatus.DRAFT, provider, {
        ...baseMetadata,
        skipped: true,
        reason: "Customer email is not available.",
      });
      return messageLog;
    }

    const result = await sendEmail({
      to: recipient,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      replyTo: emailConfig.replyTo,
      metadata: {
        messageLogId: messageLog.id,
        template: request.template,
      },
    });

    if (!result.ok) {
      await markMessage(db, messageLog.id, MessageStatus.FAILED, result.provider, {
        ...baseMetadata,
        failed: true,
        errorCode: result.errorCode ?? "EMAIL_SEND_FAILED",
        error: result.errorMessage ?? "Email send failed.",
      });

      await db.integrationEvent.create({
        data: {
          type: "notification.email.failed",
          aggregateType: "MessageLog",
          aggregateId: messageLog.id,
          payload: {
            messageLogId: messageLog.id,
            template: request.template,
            provider: result.provider,
            errorCode: result.errorCode ?? null,
            error: result.errorMessage ?? "Email send failed.",
            customerId: request.recipient.customerId ?? null,
            ticketId: request.recipient.ticketId ?? null,
          },
        },
      });

      return messageLog;
    }

    if (result.disabled || result.dryRun) {
      await markMessage(db, messageLog.id, MessageStatus.DRAFT, result.provider, {
        ...baseMetadata,
        ...jsonObjectMetadata(result.metadata),
        dryRun: result.dryRun,
        disabled: result.disabled,
      });
      return messageLog;
    }

    await markMessage(
      db,
      messageLog.id,
      MessageStatus.SENT,
      result.provider,
      {
        ...baseMetadata,
        ...jsonObjectMetadata(result.metadata),
      },
      result.providerMessageId,
    );

    await db.integrationEvent.create({
      data: {
        type: "notification.email.sent",
        aggregateType: "MessageLog",
        aggregateId: messageLog.id,
        payload: {
          messageLogId: messageLog.id,
          template: request.template,
          provider: result.provider,
          providerMessageId: result.providerMessageId ?? null,
          customerId: request.recipient.customerId ?? null,
          ticketId: request.recipient.ticketId ?? null,
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown email error.";

    console.error("Transactional email failed", {
      template: request.template,
      messageLogId: messageLog.id,
      error: errorMessage,
    });

    await markMessage(db, messageLog.id, MessageStatus.FAILED, provider, {
      ...baseMetadata,
      failed: true,
      error: errorMessage,
    });

    await db.integrationEvent.create({
      data: {
        type: "notification.email.failed",
        aggregateType: "MessageLog",
        aggregateId: messageLog.id,
        payload: {
          messageLogId: messageLog.id,
          template: request.template,
          provider,
          error: errorMessage,
          customerId: request.recipient.customerId ?? null,
          ticketId: request.recipient.ticketId ?? null,
        },
      },
    });
  }

  return messageLog;
}

function jsonObjectMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata;
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
  providerMessageId?: string,
) {
  await db.messageLog.update({
    where: { id },
    data: {
      status,
      provider,
      providerMessageId: providerMessageId ?? null,
      sentAt: status === MessageStatus.SENT ? new Date() : undefined,
      metadata: metadata ?? undefined,
    },
  });
}
