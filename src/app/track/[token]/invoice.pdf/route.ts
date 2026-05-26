import { NextResponse } from "next/server";

import { getPublicInvoicePdfAccess } from "@/modules/customer-portal/tracking.service";
import { generateInvoicePdf } from "@/modules/pdf/invoice-pdf.service";
import { getClientIdentity } from "@/server/security/client-identity";
import { checkRateLimit, publicRateLimitConfig } from "@/server/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = getClientIdentity(request.headers);
  const rateLimit = checkRateLimit(`public-pdf:invoice:${client.ip}:${token}`, publicRateLimitConfig());

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo mas tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

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
