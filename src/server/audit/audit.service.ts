import type { Prisma, PrismaClient } from "@prisma/client";

export type AuditInput = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
};

type AuditClient = Pick<PrismaClient, "auditLog">;

export async function writeAuditLog(db: AuditClient, input: AuditInput) {
  return db.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      before: input.before,
      after: input.after,
      metadata: input.metadata,
    },
  });
}

