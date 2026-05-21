import type { Prisma } from "@prisma/client";

type MessageMetadata = {
  template?: string;
  htmlPreview?: string;
  portalUrl?: string;
  error?: string;
  reason?: string;
  skipped?: boolean;
  failed?: boolean;
};

export function parseMessageMetadata(metadata: Prisma.JsonValue | null): MessageMetadata {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return {
    template: stringValue(metadata.template),
    htmlPreview: stringValue(metadata.htmlPreview),
    portalUrl: stringValue(metadata.portalUrl),
    error: stringValue(metadata.error),
    reason: stringValue(metadata.reason),
    skipped: booleanValue(metadata.skipped),
    failed: booleanValue(metadata.failed),
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}
