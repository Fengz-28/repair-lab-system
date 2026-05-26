import "server-only";

export type ClientIdentity = {
  ip: string;
  userAgent?: string;
};

export function getClientIdentity(headers: Headers): ClientIdentity {
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  const userAgent = headers.get("user-agent") || undefined;

  return { ip, userAgent };
}

