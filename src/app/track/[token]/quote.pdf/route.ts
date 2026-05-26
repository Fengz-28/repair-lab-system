import { NextResponse } from "next/server";

import { getPublicQuotePdfAccess } from "@/modules/customer-portal/tracking.service";
import { generateQuotePdf } from "@/modules/pdf/quote-pdf.service";
import { getClientIdentity } from "@/server/security/client-identity";
import { checkRateLimit, publicRateLimitConfig } from "@/server/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = getClientIdentity(request.headers);
  const rateLimit = checkRateLimit(`public-pdf:quote:${client.ip}:${token}`, publicRateLimitConfig());

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
