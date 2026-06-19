import { constants } from "node:fs";
import { access, mkdir } from "node:fs/promises";

import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";
import { privateStorageRoot } from "@/server/storage/private-storage-root";

export const dynamic = "force-dynamic";

type HealthStatus = "ok" | "degraded";
type ComponentStatus = "ok" | "error";

export async function GET() {
  const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);
  const status: HealthStatus = database === "ok" && storage === "ok" ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      database,
      storage,
      timestamp: new Date().toISOString(),
    },
    {
      status: status === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

async function checkDatabase(): Promise<ComponentStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

async function checkStorage(): Promise<ComponentStatus> {
  try {
    const root = privateStorageRoot();
    await mkdir(root, { recursive: true });
    await access(root, constants.R_OK | constants.W_OK);
    return "ok";
  } catch {
    return "error";
  }
}
