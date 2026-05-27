import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  retryDelayMilliseconds,
  unsupportedEventResult,
} from "../src/server/integrations/outbox/outbox.rules.mjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to process integration events.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

const batchSize = readPositiveInt("INTEGRATION_WORKER_BATCH_SIZE", 10);
const maxRetries = readPositiveInt("INTEGRATION_WORKER_MAX_RETRIES", 5);
const staleProcessingMinutes = readPositiveInt("INTEGRATION_WORKER_STALE_PROCESSING_MINUTES", 15);
const supportedNoopEvents = new Set([
  "ticket.created",
  "ticket.updated",
  "ticket.status_changed",
  "ticket.ready_for_pickup",
  "ticket.delivered",
  "ticket.comment_added",
  "ticket.technical_note_added",
  "ticket.attachment_added",
  "quote.created",
  "quote.updated",
  "quote.sent",
  "quote.approved",
  "quote.rejected",
  "quote.expired",
  "invoice.created",
  "invoice.payment_recorded",
  "invoice.paid",
  "receipt.created",
  "inventory.adjusted",
  "inventory.discounted",
  "inventory.tracking_updated",
  "service.created",
  "service.updated",
  "product.created",
  "product.updated",
  "notification.email.placeholder_created",
  "notification.email.sent",
  "notification.email.failed",
]);

let processed = 0;
let failed = 0;
let cancelled = 0;

try {
  const candidates = await findCandidates();

  console.log(`Integration worker found ${candidates.length} candidate event(s).`);

  for (const candidate of candidates) {
    const event = await claimEvent(candidate.id);

    if (!event) {
      console.log(`Skipped event ${candidate.id}; it was claimed or updated by another worker.`);
      continue;
    }

    console.log(`Processing event ${safeEventLabel(event)}.`);

    try {
      const result = await processIntegrationEvent(event);

      if (result.status === "cancelled") {
        await markCancelled(event.id, result.reason);
        cancelled += 1;
        console.log(`Cancelled event ${safeEventLabel(event)}: ${result.reason}`);
        continue;
      }

      await markProcessed(event.id);
      processed += 1;
      console.log(`Processed event ${safeEventLabel(event)}.`);
    } catch (error) {
      const message = summarizeError(error);
      await markFailed(event, message);
      failed += 1;
      console.log(`Failed event ${safeEventLabel(event)}: ${message}`);
    }
  }

  console.log("Integration worker summary:");
  console.log(`- processed: ${processed}`);
  console.log(`- failed: ${failed}`);
  console.log(`- cancelled: ${cancelled}`);
} finally {
  await prisma.$disconnect();
}

async function findCandidates() {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - staleProcessingMinutes * 60 * 1000);

  return prisma.integrationEvent.findMany({
    where: {
      attempts: {
        lt: maxRetries,
      },
      OR: [
        {
          status: "PENDING",
          availableAt: {
            lte: now,
          },
        },
        {
          status: "FAILED",
          availableAt: {
            lte: now,
          },
        },
        {
          status: "PROCESSING",
          updatedAt: {
            lte: staleBefore,
          },
        },
      ],
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    take: batchSize,
    select: {
      id: true,
    },
  });
}

async function claimEvent(id) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - staleProcessingMinutes * 60 * 1000);

    const claimed = await tx.integrationEvent.updateMany({
      where: {
        id,
        attempts: {
          lt: maxRetries,
        },
        OR: [
          {
            status: "PENDING",
            availableAt: {
              lte: now,
            },
          },
          {
            status: "FAILED",
            availableAt: {
              lte: now,
            },
          },
          {
            status: "PROCESSING",
            updatedAt: {
              lte: staleBefore,
            },
          },
        ],
      },
      data: {
        status: "PROCESSING",
        lastError: null,
      },
    });

    if (claimed.count !== 1) {
      return null;
    }

    return tx.integrationEvent.findUniqueOrThrow({
      where: {
        id,
      },
    });
  });
}

async function processIntegrationEvent(event) {
  if (event.type === "notification.email.sent" || event.type === "notification.email.failed") {
    return processEmailOutcomeEvent(event);
  }

  if (event.type === "notification.email.requested") {
    throw new Error(
      "notification.email.requested is reserved for the future email outbox flow and is not enabled yet.",
    );
  }

  if (supportedNoopEvents.has(event.type)) {
    return {
      status: "processed",
    };
  }

  return unsupportedEventResult(event.type);
}

async function processEmailOutcomeEvent(event) {
  const payload = asObject(event.payload);
  const messageLogId = typeof payload.messageLogId === "string" ? payload.messageLogId : null;

  if (!messageLogId) {
    return {
      status: "cancelled",
      reason: "Email event payload does not include messageLogId.",
    };
  }

  const message = await prisma.messageLog.findUnique({
    where: {
      id: messageLogId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!message) {
    return {
      status: "cancelled",
      reason: "Email event references a MessageLog that no longer exists.",
    };
  }

  return {
    status: "processed",
  };
}

async function markProcessed(id) {
  await prisma.integrationEvent.update({
    where: {
      id,
    },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
      lastError: null,
    },
  });
}

async function markCancelled(id, reason) {
  await prisma.integrationEvent.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
      processedAt: new Date(),
      lastError: truncate(reason),
    },
  });
}

async function markFailed(event, message) {
  const nextAttempts = event.attempts + 1;
  const retryDelayMs = retryDelayMilliseconds(nextAttempts);

  await prisma.integrationEvent.update({
    where: {
      id: event.id,
    },
    data: {
      status: "FAILED",
      attempts: {
        increment: 1,
      },
      availableAt: new Date(Date.now() + retryDelayMs),
      lastError: truncate(message),
    },
  });
}

function summarizeError(error) {
  if (error instanceof Error) {
    return error.message || "Unknown integration worker error.";
  }

  return "Unknown integration worker error.";
}

function safeEventLabel(event) {
  return `${event.id} (${event.type})`;
}

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function truncate(value) {
  return value.length > 1000 ? `${value.slice(0, 997)}...` : value;
}

function readPositiveInt(name, fallback) {
  const rawValue = process.env[name];
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : fallback;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}
