import {
  CommunicationChannel,
  MessageDirection,
  MessageStatus,
  Prisma,
} from "@prisma/client";

import { renderTransactionalEmail } from "./email.templates";
import type { EmailSendResult, TransactionalEmailRequest } from "./email.types";

type EmailDb = Prisma.TransactionClient;

export async function sendTransactionalEmailSafely(
  db: EmailDb,
  request: TransactionalEmailRequest,
) {
  const rendered = renderTransactionalEmail(request.template, request.data);
  const recipient = request.recipient.email ?? null;
  const provider = configuredEmailProvider();
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

    if (provider === "disabled") {
      await markMessage(db, messageLog.id, MessageStatus.DRAFT, provider, {
        ...baseMetadata,
        skipped: true,
        reason: "EMAIL_PROVIDER=disabled",
      });
      return messageLog;
    }

    const result = await sendEmail({
      to: recipient,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });

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

function jsonObjectMetadata(metadata: Prisma.InputJsonValue | undefined) {
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

function configuredEmailProvider() {
  return process.env.EMAIL_PROVIDER?.trim() || "console";
}

async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<EmailSendResult> {
  const provider = configuredEmailProvider();

  if (provider === "resend") {
    return sendWithResend(input);
  }

  console.info("Transactional email preview", {
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  return {
    provider: "console",
    metadata: {
      previewOnly: true,
    },
  };
}

async function sendWithResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_KEY;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;

  if (!apiKey || !from) {
    throw new Error("Resend email is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

  if (!response.ok) {
    throw new Error(body?.message ?? `Resend failed with status ${response.status}.`);
  }

  return {
    provider: "resend",
    providerMessageId: body?.id,
  };
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
