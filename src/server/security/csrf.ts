import "server-only";

import { headers } from "next/headers";

export async function requireSameOriginRequest() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (!origin) {
    return;
  }

  const allowedOrigins = new Set(
    [
      requestOrigin(requestHeaders),
      configuredOrigin(process.env.APP_URL),
      configuredOrigin(process.env.PUBLIC_SITE_URL),
      configuredOrigin(process.env.NEXT_PUBLIC_APP_URL),
    ].filter((value): value is string => Boolean(value)),
  );

  if (!allowedOrigins.has(origin)) {
    throw new Error("Solicitud rechazada por origen no permitido.");
  }
}

function requestOrigin(requestHeaders: Headers) {
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return null;
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`;
}

function configuredOrigin(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
