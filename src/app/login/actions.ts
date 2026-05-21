"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createStaffSession } from "@/server/auth/local-admin";
import { verifyPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/prisma";

export type LoginActionState = {
  ok: boolean;
  message: string;
};

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ingresa un email y password validos.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: {
      id: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user?.isActive || !user.passwordHash) {
    return {
      ok: false,
      message: "Credenciales invalidas.",
    };
  }

  const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    return {
      ok: false,
      message: "Credenciales invalidas.",
    };
  }

  await createStaffSession(user.id);
  redirect("/admin");
}
