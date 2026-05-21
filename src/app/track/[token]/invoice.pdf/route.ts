import { NextResponse } from "next/server";

import { getPublicInvoicePdfAccess } from "@/modules/customer-portal/tracking.service";
import { generateInvoicePdf } from "@/modules/pdf/invoice-pdf.service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const access = await getPublicInvoicePdfAccess(token);

  if (!access) {
    return NextResponse.json({ error: "Factura no encontrada." }, { status: 404 });
  }

  const pdf = await generateInvoicePdf(access.invoiceId);

  return new NextResponse(pdf.bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename}"`,
    },
  });
}
