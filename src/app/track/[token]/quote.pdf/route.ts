import { NextResponse } from "next/server";

import { getPublicQuotePdfAccess } from "@/modules/customer-portal/tracking.service";
import { generateQuotePdf } from "@/modules/pdf/quote-pdf.service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const access = await getPublicQuotePdfAccess(token);

  if (!access) {
    return NextResponse.json({ error: "Cotizacion no encontrada." }, { status: 404 });
  }

  const pdf = await generateQuotePdf(access.quoteId, { includeInternalReference: false });

  return new NextResponse(pdf.bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename}"`,
    },
  });
}
