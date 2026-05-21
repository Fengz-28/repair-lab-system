import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import { QuoteHero } from "@/components/repairlab/quote-hero";
import { RepairContainer } from "@/components/repairlab";
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

  const quoteDtos = quotes.map((quote) => ({
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
  }));
  const latestQuote = quoteDtos[0];
  const customerName = `${ticket.customer.firstName} ${ticket.customer.lastName ?? ""}`.trim();
  const deviceLabel = `${ticket.device.brand} ${ticket.device.model ?? ""}`.trim();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AdminNav />
      <QuoteHero
        ticketId={ticket.id}
        ticketNumber={ticket.ticketNumber}
        customerName={customerName}
        deviceLabel={deviceLabel}
        quoteCount={quotes.length}
        latestTotal={latestQuote ? `${latestQuote.currency} ${latestQuote.total}` : "Sin cotizacion"}
        latestStatus={latestQuote ? quoteStatusLabel(latestQuote.status) : "Pendiente"}
      />

      <RepairContainer className="space-y-6 py-8">
        <QuoteAdmin
          ticketId={ticket.id}
          ticketStatus={ticket.status}
          catalogItems={catalogItems.map((item) => ({
            id: item.id,
            label: `${catalogTypeLabel(item.type)} - ${item.name}${item.basePrice ? ` (CRC ${item.basePrice.toString()})` : ""}`,
            type: item.type,
            basePrice: item.basePrice?.toString() ?? null,
          }))}
          quotes={quoteDtos}
        />
      </RepairContainer>
    </main>
  );
}

function catalogTypeLabel(type: string) {
  const labels: Record<string, string> = {
    SERVICE: "Servicio",
    PRODUCT: "Producto",
    PART: "Repuesto",
  };

  return labels[type] ?? type;
}

function quoteStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
    PAID: "Pagada",
    PARTIALLY_PAID: "Pago parcial",
    UNPAID: "Sin pago",
  };

  return labels[status] ?? status;
}
