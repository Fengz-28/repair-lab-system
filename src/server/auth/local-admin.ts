import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "repair_lab_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type LocalStaffSession = {
  userId: string;
  email: string;
  name: string | null;
  role: UserRole;
  mode: "authenticated";
};

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

type RequireStaffOptions = {
  roles?: UserRole[];
};

export async function requireLocalStaff(
  options: RequireStaffOptions = {},
): Promise<LocalStaffSession> {
  const session = await getCurrentStaffSession();

  if (!session) {
    redirect("/login");
  }

  if (options.roles && !options.roles.includes(session.role)) {
    throw new Error("No tienes permisos para realizar esta acción.");
  }

  return session;
}

export async function getCurrentStaffSession(): Promise<LocalStaffSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mode: "authenticated",
  };
}

export async function createStaffSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signSessionToken({ userId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearStaffSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

function signSessionToken(payload: Omit<SessionPayload, "expiresAt">) {
  const fullPayload: SessionPayload = {
    ...payload,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;

    if (!payload.userId || payload.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

function authSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret === "replace-with-local-secret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be configured in production.");
    }

    return "dev-only-repair-lab-auth-secret";
  }

  return secret;
}

export { UserRole };
