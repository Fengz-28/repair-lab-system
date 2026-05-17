import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";

import { QuoteAdmin } from "@/modules/quotes/components/quote-admin";
import { getAllowedQuoteStatuses } from "@/modules/quotes/quote.lifecycle";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function TicketQuotesPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  await requireLocalStaff();
  const { ticketId } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      customer: true,
      device: true,
    },
  });

  if (!ticket) {
    notFound();
  }

  const [quotes, catalogItems] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        ticketId,
        type: InvoiceType.QUOTE,
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            catalogItem: true,
          },
        },
      },
    }),
    prisma.catalogItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
      <header className="space-y-2">
        <Link className="text-sm text-zinc-600 underline" href={`/admin/tickets/${ticket.id}`}>
          Volver al ticket
        </Link>
        <p className="text-sm font-medium text-zinc-500">
          Ticket {ticket.ticketNumber} / Cotizaciones
        </p>
        <h1 className="text-2xl font-semibold text-zinc-950">
          Cotizaciones para {ticket.device.brand} {ticket.device.model ?? ""}
        </h1>
        <p className="max-w-3xl text-sm text-zinc-600">
          Flujo comercial placeholder para aprobacion futura. Sin pagos, PDF ni envio real.
        </p>
      </header>

      <QuoteAdmin
        ticketId={ticket.id}
        catalogItems={catalogItems.map((item) => ({
          id: item.id,
          label: `${item.type} - ${item.name}${item.basePrice ? ` (CRC ${item.basePrice.toString()})` : ""}`,
          type: item.type,
          basePrice: item.basePrice?.toString() ?? null,
        }))}
        quotes={quotes.map((quote) => ({
          id: quote.id,
          invoiceNumber: quote.invoiceNumber,
          status: quote.status,
          subtotal: quote.subtotal.toString(),
          total: quote.total.toString(),
          currency: quote.currency,
          customerNotes: quote.customerNotes,
          internalNotes: quote.internalNotes,
          approvalToken: quote.approvalToken,
          approvalExpiresAt: quote.approvalExpiresAt?.toLocaleDateString("es-CR") ?? null,
          allowedNextStatuses: getAllowedQuoteStatuses(quote.status),
          items: quote.items.map((item) => ({
            id: item.id,
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            lineTotal: item.lineTotal.toString(),
            catalogItemName: item.catalogItem?.name ?? null,
          })),
        }))}
      />
    </main>
  );
}

