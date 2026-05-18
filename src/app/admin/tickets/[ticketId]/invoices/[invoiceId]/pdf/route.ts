import { NextResponse } from "next/server";

import { generateInvoicePdf } from "@/modules/pdf/invoice-pdf.service";
import { requireLocalStaff } from "@/server/auth/local-admin";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  await requireLocalStaff();
  const { invoiceId } = await params;

  try {
    const pdf = await generateInvoicePdf(invoiceId);

    return new NextResponse(pdf.bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdf.filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo generar el PDF." },
      { status: 404 },
    );
  }
}
