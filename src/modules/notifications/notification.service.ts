import { Prisma } from "@prisma/client";

import { sendTransactionalEmailSafely } from "@/modules/email/email.service";

import { notificationRequestSchema, type NotificationRequest } from "./notification.schema";

type NotificationDb = Prisma.TransactionClient;

export async function registerEmailNotificationPlaceholder(
  db: NotificationDb,
  request: NotificationRequest,
) {
  const parsed = notificationRequestSchema.parse(request);
  return sendTransactionalEmailSafely(db, parsed);
}
