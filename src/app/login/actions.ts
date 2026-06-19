"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createStaffSession } from "@/server/auth/local-admin";
import { recordLoginAttempt } from "@/server/auth/login-attempts";
import { verifyPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/prisma";
import { getClientIdentity } from "@/server/security/client-identity";
import { requireSameOriginRequest } from "@/server/security/csrf";
import { checkRateLimit, loginRateLimitConfig, resetRateLimit } from "@/server/security/rate-limit";

export type LoginActionState = {
  ok: boolean;
  message: string;
};

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  await requireSameOriginRequest();

  const requestHeaders = await headers();
  const client = getClientIdentity(requestHeaders);
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    await recordLoginAttempt({
      email: String(formData.get("email") ?? "invalid"),
      success: false,
      reason: "invalid_input",
      client,
    });

    return {
      ok: false,
      message: "Ingresa un email y password validos.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const rateLimitKey = `login:${client.ip}:${email}`;
  const rateLimit = checkRateLimit(rateLimitKey, loginRateLimitConfig());

  if (!rateLimit.allowed) {
    await recordLoginAttempt({
      email,
      success: false,
      reason: "rate_limited",
      client,
    });

    return {
      ok: false,
      message: "Demasiados intentos. Espera unos minutos antes de volver a intentar.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user?.isActive || !user.passwordHash) {
    await recordLoginAttempt({
      email,
      success: false,
      reason: "invalid_credentials",
      client,
    });

    return {
      ok: false,
      message: "Credenciales invalidas.",
    };
  }

  const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    await recordLoginAttempt({
      email,
      success: false,
      reason: "invalid_credentials",
      client,
    });

    return {
      ok: false,
      message: "Credenciales invalidas.",
    };
  }

  resetRateLimit(rateLimitKey);
  await recordLoginAttempt({
    email,
    success: true,
    reason: "authenticated",
    client,
  });

  await createStaffSession(user.id);
  redirect(safeAdminRedirect(parsed.data.next));
}

function safeAdminRedirect(value?: string) {
  if (!value || !value.startsWith("/admin")) {
    return "/admin";
  }

  if (value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return "/admin";
  }

  return value;
}
