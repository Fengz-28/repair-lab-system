import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import type { InvoiceStatus, PaymentStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import { InvoiceHero } from "@/components/repairlab/invoice-hero";
import { RepairContainer, RepairPanel } from "@/components/repairlab";
import { RepairInventoryTable } from "@/components/repairlab/inventory-table";
import { PaymentAdmin } from "@/modules/payments/components/payment-admin";
import { calculatePaymentTotals } from "@/modules/payments/payment.service";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function TicketInvoicePage({
  params,
}: {
  params: Promise<{ ticketId: string; invoiceId: string }>;
}) {
  await requireLocalStaff();
  const { ticketId, invoiceId } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      ticketId,
      type: InvoiceType.INVOICE,
    },
    include: {
      customer: true,
      ticket: {
        include: {
          device: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          catalogItem: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!invoice || !invoice.ticket) {
    notFound();
  }

  const paymentTotals = calculatePaymentTotals(invoice.total, invoice.payments);
  const customerName = `${invoice.customer.firstName} ${invoice.customer.lastName ?? ""}`.trim();
  const pdfHref = `/admin/tickets/${ticketId}/invoices/${invoice.id}/pdf`;

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <AdminNav />
      <InvoiceHero
        ticketId={ticketId}
        invoiceNumber={invoice.invoiceNumber}
        ticketNumber={invoice.ticket.ticketNumber}
        customerName={customerName}
        paymentStatus={paymentStatusLabel(invoice.paymentStatus)}
        total={`${invoice.currency} ${paymentTotals.invoiceTotal.toFixed(2)}`}
        paid={`${invoice.currency} ${paymentTotals.paidTotal.toFixed(2)}`}
        balance={`${invoice.currency} ${paymentTotals.balanceDue.toFixed(2)}`}
        pdfHref={pdfHref}
      />

      <RepairContainer className="space-y-6 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Cliente" value={customerName} />
          <InfoItem
            label="Contacto"
            value={invoice.customer.whatsappPhone ?? invoice.customer.phone ?? invoice.customer.email ?? "Sin contacto"}
          />
          <InfoItem label="Ticket" value={`${invoice.ticket.ticketNumber} - ${invoice.ticket.title}`} />
          <InfoItem label="Equipo" value={`${invoice.ticket.device.brand} ${invoice.ticket.device.model ?? ""}`.trim()} />
          <InfoItem label="Fecha" value={invoice.createdAt.toLocaleString("es-CR")} />
          <InfoItem label="Estado" value={invoiceStatusLabel(invoice.status)} />
        </section>

        <RepairPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                Line items
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-zinc-50">Lineas facturadas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label="Factura" value={invoiceStatusLabel(invoice.status)} />
              <PaymentStatusBadge status={invoice.paymentStatus} />
            </div>
          </div>
          <RepairInventoryTable>
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-zinc-950/95 text-zinc-300">
              <tr>
                <th className="border-b border-white/10 px-3 py-2">Tipo</th>
                <th className="border-b border-white/10 px-3 py-2">Descripcion</th>
                <th className="border-b border-white/10 px-3 py-2">Cantidad</th>
                <th className="border-b border-white/10 px-3 py-2">Unitario</th>
                <th className="border-b border-white/10 px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 transition last:border-0 hover:bg-emerald-50/50 dark:border-zinc-800 dark:hover:bg-emerald-950/20">
                  <td className="px-3 py-2">{itemTypeLabel(item.itemType)}</td>
                  <td className="px-3 py-2">
                    <p className="break-words">{item.description}</p>
                    {item.catalogItem ? (
                      <p className="text-zinc-500 dark:text-zinc-400">Catalogo: {item.catalogItem.name}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{item.unitPrice.toString()}</td>
                  <td className="px-3 py-2">{item.lineTotal.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </RepairInventoryTable>
        </RepairPanel>

        <section className="ml-auto w-full max-w-md space-y-2 rounded-3xl border border-white/10 bg-zinc-950/90 p-5 text-sm shadow-sm shadow-black/30">
          <TotalRow label="Subtotal" value={`${invoice.currency} ${invoice.subtotal.toString()}`} />
          <TotalRow label="Impuestos" value={`${invoice.currency} ${invoice.taxTotal.toString()}`} />
          <TotalRow label="Total" value={`${invoice.currency} ${invoice.total.toString()}`} strong />
        </section>

        <PaymentAdmin
          ticketId={ticketId}
          invoiceId={invoice.id}
          currency={invoice.currency}
          invoiceTotal={paymentTotals.invoiceTotal.toFixed(2)}
          paidTotal={paymentTotals.paidTotal.toFixed(2)}
          balanceDue={paymentTotals.balanceDue.toFixed(2)}
          paymentStatus={invoice.paymentStatus}
          payments={invoice.payments.map((payment) => ({
            id: payment.id,
            amount: payment.amount.toString(),
            method: payment.method,
            reference: payment.reference,
            notes: payment.notes,
            createdAt: payment.createdAt.toLocaleString("es-CR"),
          }))}
        />
      </RepairContainer>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <RepairPanel>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-zinc-950 dark:text-zinc-50">{value}</p>
    </RepairPanel>
  );
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
      <span className="uppercase">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    UNPAID: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    PARTIALLY_PAID: "border-cyan-400/30 bg-cyan-500/15 text-cyan-100",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    REFUNDED: "border-white/10 bg-zinc-900 text-zinc-200",
    VOID: "border-white/10 bg-zinc-900 text-zinc-200",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${classes[status]}`}>
      <span className="uppercase">Pago</span>
      <span>{paymentStatusLabel(status)}</span>
    </span>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex flex-wrap justify-between gap-2 ${strong ? "text-base font-semibold text-zinc-950 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-300"}`}>
      <span>{label}</span>
      <span className="break-words">{value}</span>
    </div>
  );
}

function invoiceStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
    PAID: "Pagada",
    PARTIALLY_PAID: "Pago parcial",
    UNPAID: "Pendiente",
  };

  return labels[status] ?? status;
}

function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    UNPAID: "Pendiente",
    PARTIALLY_PAID: "Parcialmente pagada",
    PAID: "Pagada",
    REFUNDED: "Reembolsada",
    VOID: "Anulada",
  };

  return labels[status] ?? status;
}

function itemTypeLabel(type: string) {
  const labels: Record<string, string> = {
    SERVICE: "Servicio",
    PRODUCT: "Producto",
    PART: "Repuesto",
  };

  return labels[type] ?? type;
}
