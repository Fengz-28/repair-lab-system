import "server-only";

import { prisma } from "@/server/db/prisma";
import type { ClientIdentity } from "@/server/security/client-identity";

type LoginAttemptInput = {
  email: string;
  success: boolean;
  reason?: string;
  client: ClientIdentity;
};

export async function recordLoginAttempt(input: LoginAttemptInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.success ? "auth.login_success" : "auth.login_failed",
        entityType: "User",
        entityId: null,
        ipAddress: input.client.ip,
        userAgent: input.client.userAgent,
        metadata: {
          email: input.email.toLowerCase(),
          success: input.success,
          reason: input.reason,
        },
      },
    });
  } catch (error) {
    console.error("recordLoginAttempt failed", error);
  }
}

