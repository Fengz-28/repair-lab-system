import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import type { InvoiceStatus, PaymentStatus } from "@prisma/client";

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

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
      <header className="space-y-2">
        <Link className="text-sm text-zinc-600 underline dark:text-zinc-300" href={`/admin/tickets/${ticketId}`}>
          Volver al ticket
        </Link>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Factura interna {invoice.invoiceNumber}
        </p>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Factura para ticket {invoice.ticket.ticketNumber}
        </h1>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label="Factura" value={invoiceStatusLabel(invoice.status)} />
          <PaymentStatusBadge status={invoice.paymentStatus} />
          <span className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
            Total facturado: {invoice.currency} {invoice.total.toString()}
          </span>
        </div>
        <a
          className="inline-flex rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
          href={`/admin/tickets/${ticketId}/invoices/${invoice.id}/pdf`}
        >
          Descargar factura PDF
        </a>
      </header>

      <section className="grid gap-4 rounded border border-zinc-200 p-4 dark:border-zinc-800 md:grid-cols-2">
        <InfoItem
          label="Cliente"
          value={`${invoice.customer.firstName} ${invoice.customer.lastName ?? ""}`.trim()}
        />
        <InfoItem
          label="Contacto"
          value={invoice.customer.whatsappPhone ?? invoice.customer.phone ?? invoice.customer.email ?? "Sin contacto"}
        />
        <InfoItem
          label="Ticket"
          value={`${invoice.ticket.ticketNumber} - ${invoice.ticket.title}`}
        />
        <InfoItem
          label="Equipo"
          value={`${invoice.ticket.device.brand} ${invoice.ticket.device.model ?? ""}`.trim()}
        />
        <InfoItem label="Fecha" value={invoice.createdAt.toLocaleString("es-CR")} />
        <InfoItem label="Estado" value={invoiceStatusLabel(invoice.status)} />
      </section>

      <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Lineas facturadas</h2>
        <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Tipo</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Descripcion</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Cantidad</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Unitario</th>
                <th className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="px-3 py-2">{itemTypeLabel(item.itemType)}</td>
                  <td className="px-3 py-2">
                    <p>{item.description}</p>
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
        </div>
      </section>

      <section className="ml-auto w-full max-w-sm space-y-2 rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
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
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
      <span className="uppercase">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    UNPAID: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
    PARTIALLY_PAID: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    REFUNDED: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
    VOID: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded border px-3 py-1 text-xs font-medium ${classes[status]}`}>
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
    <div className={`flex justify-between gap-3 ${strong ? "text-base font-semibold text-zinc-950 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-300"}`}>
      <span>{label}</span>
      <span>{value}</span>
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
