import { NextResponse } from "next/server";

import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";
import { getPrivateFile } from "@/server/storage/private-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileAssetId: string }> },
) {
  await requireLocalStaff();
  const { fileAssetId } = await params;

  const fileAsset = await prisma.fileAsset.findUnique({
    where: { id: fileAssetId },
    select: {
      id: true,
      storageKey: true,
      originalName: true,
      mimeType: true,
      visibility: true,
      deletedAt: true,
      ticketId: true,
      intakeId: true,
    },
  });

  if (!fileAsset || fileAsset.deletedAt || fileAsset.visibility !== "PRIVATE") {
    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }

  if (!fileAsset.ticketId && !fileAsset.intakeId) {
    return NextResponse.json({ error: "Archivo no disponible." }, { status: 404 });
  }

  try {
    const file = await getPrivateFile(fileAsset.storageKey);

    return new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": fileAsset.mimeType,
        "Content-Length": String(file.size),
        "Content-Disposition": `${contentDispositionType(fileAsset.mimeType)}; filename="${safeHeaderFilename(fileAsset.originalName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("get admin private file failed", error);

    return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
  }
}

function contentDispositionType(mimeType: string) {
  return mimeType.startsWith("image/") || mimeType === "application/pdf" ? "inline" : "attachment";
}

function safeHeaderFilename(filename: string) {
  return filename.replace(/["\r\n]/g, "_");
}
