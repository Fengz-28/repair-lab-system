import { CommunicationChannel, MessageDirection, MessageStatus, Prisma } from "@prisma/client";

import { notificationRequestSchema, type NotificationRequest } from "./notification.schema";
import { renderEmailTemplate } from "./templates/email-templates";

type NotificationDb = Prisma.TransactionClient;

export async function registerEmailNotificationPlaceholder(
  db: NotificationDb,
  request: NotificationRequest,
) {
  const parsed = notificationRequestSchema.parse(request);
  const rendered = renderEmailTemplate(parsed.template, parsed.data);

  const messageLog = await db.messageLog.create({
    data: {
      customerId: parsed.recipient.customerId ?? null,
      ticketId: parsed.recipient.ticketId ?? null,
      channel: CommunicationChannel.EMAIL,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.DRAFT,
      provider: "disabled",
      recipient: parsed.recipient.email ?? null,
      subject: rendered.subject,
      body: rendered.text,
      metadata: {
        placeholder: true,
        template: parsed.template,
        htmlPreview: rendered.html,
        reason: "SMTP provider is not configured.",
        privacy: "No private file URLs or equipment photos are included.",
      },
    },
  });

  await db.integrationEvent.create({
    data: {
      type: "notification.email.placeholder_created",
      aggregateType: "MessageLog",
      aggregateId: messageLog.id,
      payload: {
        messageLogId: messageLog.id,
        template: parsed.template,
        customerId: parsed.recipient.customerId ?? null,
        ticketId: parsed.recipient.ticketId ?? null,
        provider: "disabled",
      },
    },
  });

  return messageLog;
}

