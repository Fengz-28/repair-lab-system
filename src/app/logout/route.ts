import { redirect } from "next/navigation";

import { clearStaffSession } from "@/server/auth/local-admin";

export async function POST() {
  await clearStaffSession();
  redirect("/login");
}
