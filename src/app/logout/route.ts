import { redirect } from "next/navigation";

import { clearStaffSession } from "@/server/auth/local-admin";
import { requireSameOriginRequest } from "@/server/security/csrf";

export async function POST() {
  await requireSameOriginRequest();
  await clearStaffSession();
  redirect("/login");
}
