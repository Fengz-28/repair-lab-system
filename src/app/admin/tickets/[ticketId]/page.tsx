import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import type { InvoiceStatus, PaymentStatus, TicketStatus } from "@prisma/client";

import {
  AttachmentPlaceholderForm,
  GenerateInvoiceForm,
  InternalCommentForm,
  TechnicalNotesForm,
  TicketGuidedActions,
  TicketStatusForm,
} from "@/modules/tickets/components/ticket-actions";
import { TicketTimeline } from "@/modules/tickets/components/ticket-timeline";
import { getAllowedNextStatuses } from "@/modules/tickets/ticket.lifecycle.service";
import { requireLocalStaff } from "@/server/auth/local-admin";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
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
      intake: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        orderBy: { createdAt: "desc" },
      },
      events: {
        orderBy: { createdAt: "desc" },
      },
      files: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        where: {
          type: {
            in: [InvoiceType.QUOTE, InvoiceType.INVOICE],
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          type: true,
          status: true,
          paymentStatus: true,
          total: true,
          currency: true,
          createdAt: true,
          internalNotes: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const allowedNextStatuses = getAllowedNextStatuses(ticket.status).map((status) => ({
    value: status,
    label: ticketStatusLabel(status),
  }));
  const quotes = ticket.invoices.filter((invoice) => invoice.type === InvoiceType.QUOTE);
  const invoices = ticket.invoices.filter((invoice) => invoice.type === InvoiceType.INVOICE);
  const approvedQuote = quotes.find((quote) => quote.status === "APPROVED");
  const generatedInvoice = approvedQuote
    ? invoices.find((invoice) => invoice.internalNotes?.includes(`sourceQuoteId:${approvedQuote.id}`))
    : null;
  const canGenerateInvoice = Boolean(
    approvedQuote && approvedQuote._count.items > 0 && Number(approvedQuote.total) > 0 && !generatedInvoice,
  );
  const hasResolution = Boolean(ticket.resolution?.trim());

  const timelineItems = [
    ...ticket.statusHistory.map((entry) => ({
      id: entry.id,
      type: "status",
      title: `Estado del ticket: ${entry.fromStatus ? ticketStatusLabel(entry.fromStatus) : "Inicio"} -> ${ticketStatusLabel(entry.toStatus)}`,
      description: entry.internalComment ?? undefined,
      createdAt: entry.createdAt,
    })),
    ...ticket.comments.map((comment) => ({
      id: comment.id,
      type: "comment",
      title: comment.isInternal ? "Comentario interno" : "Comentario",
      description: comment.body,
      createdAt: comment.createdAt,
    })),
    ...ticket.events.map((event) => ({
      id: event.id,
      type: "event",
      title: getTicketEventTitle(event.type, event.payload),
      description: getTicketEventDescription(event.payload),
      createdAt: event.createdAt,
    })),
    ...ticket.files.map((file) => ({
      id: file.id,
      type: "file",
      title: `Archivo privado: ${file.originalName}`,
      description: `${file.mimeType}, ${file.byteSize} bytes`,
      createdAt: file.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <header className="space-y-2">
          <Link className="text-sm text-zinc-600 underline dark:text-zinc-300" href="/admin/tickets">
            Volver a tickets
          </Link>
          <Link className="block text-sm text-zinc-600 underline dark:text-zinc-300" href="/admin/intake">
            Volver a recepcion
          </Link>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ticket {ticket.ticketNumber}</p>
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{ticket.title}</h1>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="Ticket" value={ticketStatusLabel(ticket.status)} tone="ticket" />
            {quotes[0] ? (
              <StatusBadge
                label="Cotizacion"
                value={quoteStatusLabel(quotes[0].status)}
                tone="quote"
              />
            ) : null}
          </div>
          <Link className="text-sm text-zinc-600 underline dark:text-zinc-300" href={`/admin/tickets/${ticket.id}/quotes`}>
            Ver cotizaciones
          </Link>
        </header>

        <section className="space-y-3 rounded border border-blue-200 bg-blue-50 p-4 text-blue-950 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          <h2 className="text-base font-semibold">Siguiente paso recomendado</h2>
          <p className="text-sm">{getRecommendedTicketStep(ticket.status, Boolean(approvedQuote))}</p>
        </section>

        <section className="grid gap-4 rounded border border-zinc-200 p-4 dark:border-zinc-800 md:grid-cols-2">
          <InfoItem
            label="Cliente"
            value={`${ticket.customer.firstName} ${ticket.customer.lastName ?? ""}`}
          />
          <InfoItem
            label="Contacto"
            value={ticket.customer.whatsappPhone ?? ticket.customer.phone ?? ticket.customer.email ?? "Sin contacto"}
          />
          <InfoItem
            label="Equipo"
            value={`${ticket.device.brand} ${ticket.device.model ?? ""}`}
          />
          <InfoItem label="Serial" value={ticket.device.serial ?? "No registrado"} />
          <InfoItem label="Problema reportado" value={ticket.reportedIssue} wide />
          <InfoItem
            label="Condicion inicial"
            value={ticket.intake?.physicalCondition ?? "Sin intake asociado"}
            wide
          />
        </section>

        <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Cotizaciones</h2>
            <Link className="text-sm text-zinc-600 underline dark:text-zinc-300" href={`/admin/tickets/${ticket.id}/quotes`}>
              Abrir cotizaciones
            </Link>
          </div>
          {quotes.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No hay cotizaciones. Cuando el diagnostico tenga precio, crea una cotizacion y agrega sus lineas.
            </p>
          ) : (
            <ul className="space-y-2">
              {quotes.map((quote) => (
                <li
                  key={quote.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-100 p-3 text-sm dark:border-zinc-800"
                >
                  <div>
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">{quote.invoiceNumber}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Total estimado: {quote.currency} {quote.total.toString()}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Creada: {quote.createdAt.toLocaleString("es-CR")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label="Cotizacion" value={quoteStatusLabel(quote.status)} tone="quote" />
                    <Link
                      className="text-zinc-600 underline dark:text-zinc-300"
                      href={`/admin/tickets/${ticket.id}/quotes`}
                    >
                      Abrir
                    </Link>
                    <a
                      className="text-zinc-600 underline dark:text-zinc-300"
                      href={`/admin/tickets/${ticket.id}/quotes/${quote.id}/pdf`}
                    >
                      PDF
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Factura interna</h2>
            {generatedInvoice ? (
              <Link
                className="text-sm text-zinc-600 underline dark:text-zinc-300"
                href={`/admin/tickets/${ticket.id}/invoices/${generatedInvoice.id}`}
              >
                Ver factura
              </Link>
            ) : null}
          </div>
          {generatedInvoice ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-zinc-100 p-3 text-sm dark:border-zinc-800">
              <div>
                <p className="font-medium text-zinc-950 dark:text-zinc-50">{generatedInvoice.invoiceNumber}</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Total facturado: {generatedInvoice.currency} {generatedInvoice.total.toString()}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Creada: {generatedInvoice.createdAt.toLocaleString("es-CR")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label="Factura" value={quoteStatusLabel(generatedInvoice.status)} tone="invoice" />
                <StatusBadge label="Pago" value={paymentStatusLabel(generatedInvoice.paymentStatus)} tone="invoice" />
                <a
                  className="text-zinc-600 underline dark:text-zinc-300"
                  href={`/admin/tickets/${ticket.id}/invoices/${generatedInvoice.id}/pdf`}
                >
                  Descargar factura PDF
                </a>
              </div>
            </div>
          ) : approvedQuote ? (
            <div className="space-y-3 rounded border border-zinc-100 p-3 text-sm dark:border-zinc-800">
              <div>
                <p className="font-medium text-zinc-950 dark:text-zinc-50">
                  Cotizacion aprobada: {approvedQuote.invoiceNumber}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Total aprobado: {approvedQuote.currency} {approvedQuote.total.toString()}
                </p>
              </div>
              {canGenerateInvoice ? (
                <GenerateInvoiceForm ticketId={ticket.id} quoteId={approvedQuote.id} />
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  La factura no puede generarse hasta que la cotizacion tenga lineas y total mayor a cero.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              La factura se podra generar cuando exista una cotizacion aprobada.
            </p>
          )}
        </section>

        <TicketTimeline items={timelineItems} />

        <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Historial de estado</h2>
          <ul className="space-y-2 text-sm">
            {ticket.statusHistory.map((entry) => (
              <li key={entry.id} className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                <p>
                  {entry.fromStatus ? ticketStatusLabel(entry.fromStatus) : "Inicio"} {"->"} {ticketStatusLabel(entry.toStatus)}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">{entry.createdAt.toLocaleString("es-CR")}</p>
                {entry.internalComment ? (
                  <p className="text-zinc-700 dark:text-zinc-300">{entry.internalComment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Archivos privados</h2>
          {ticket.files.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay archivos registrados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {ticket.files.map((file) => (
                <li key={file.id} className="rounded border border-zinc-100 p-3 dark:border-zinc-800">
                  <p className="font-medium">{file.originalName}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{file.storageKey}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      <aside className="space-y-4">
        <TicketGuidedActions
          ticketId={ticket.id}
          currentStatus={ticket.status as TicketStatus}
          allowedNextStatuses={allowedNextStatuses}
          hasApprovedQuote={Boolean(approvedQuote)}
          hasResolution={hasResolution}
        />
        <TicketStatusForm
          ticketId={ticket.id}
          currentStatus={ticket.status as TicketStatus}
          allowedNextStatuses={allowedNextStatuses}
        />
        <InternalCommentForm ticketId={ticket.id} />
        <TechnicalNotesForm
          ticketId={ticket.id}
          diagnosis={ticket.diagnosis ?? ""}
          resolution={ticket.resolution ?? ""}
          internalNotes={ticket.internalNotes ?? ""}
        />
        <AttachmentPlaceholderForm ticketId={ticket.id} />
      </aside>
    </main>
  );
}

function InfoItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

function StatusBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ticket" | "quote" | "invoice";
}) {
  const classes = {
    ticket:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-100",
    quote:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
    invoice:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded border px-3 py-1 text-xs font-medium ${classes}`}>
      <span className="uppercase">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function getTicketEventTitle(type: string, payload: unknown) {
  const payloadObject = isRecord(payload) ? payload : {};

  if (typeof payloadObject.timelineLabel === "string") {
    return payloadObject.timelineLabel;
  }

  const labels: Record<string, string> = {
    "quote.created": "Cotizacion creada",
    "quote.sent": "Cotizacion enviada al cliente",
    "quote.approved": "Cotizacion aprobada",
    "quote.rejected": "Cotizacion rechazada",
    "quote.expired": "Cotizacion expirada",
    "quote.item_added": "Linea agregada a cotizacion",
    "invoice.created": "Factura generada desde cotizacion aprobada",
    "ticket.created": "Ticket creado",
    "ticket.status_changed": "Estado de ticket actualizado",
  };

  return labels[type] ?? type;
}

function getTicketEventDescription(payload: unknown) {
  if (!isRecord(payload)) {
    return undefined;
  }

  const parts = [
    typeof payload.quoteNumber === "string" ? `Cotizacion ${payload.quoteNumber}` : undefined,
    typeof payload.fromStatus === "string" && typeof payload.toStatus === "string"
      ? `${statusLabel(payload.fromStatus, Boolean(payload.quoteNumber))} -> ${statusLabel(payload.toStatus, Boolean(payload.quoteNumber))}`
      : undefined,
    typeof payload.ticketStatusChangedTo === "string"
      ? `Ticket: ${ticketStatusLabel(payload.ticketStatusChangedTo as TicketStatus)}`
      : undefined,
    typeof payload.total === "string" && typeof payload.currency === "string"
      ? `Total estimado: ${payload.currency} ${payload.total}`
      : undefined,
    typeof payload.internalComment === "string" ? payload.internalComment : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecommendedTicketStep(status: TicketStatus, hasApprovedQuote: boolean) {
  if (status === "RECEIVED") {
    return "Realiza la revision inicial del equipo.";
  }

  if (status === "INITIAL_REVIEW") {
    return "Pasa el ticket a diagnostico cuando el equipo este listo para revision tecnica.";
  }

  if (status === "DIAGNOSIS") {
    return "Registra el diagnostico tecnico y crea una cotizacion si el cliente debe aprobar un costo.";
  }

  if (status === "WAITING_APPROVAL") {
    return "Espera la aprobacion o rechazo de la cotizacion enviada.";
  }

  if (status === "APPROVED" && hasApprovedQuote) {
    return "La cotizacion fue aprobada. Puedes iniciar la reparacion del equipo.";
  }

  if (status === "APPROVED") {
    return "Revisa la cotizacion aprobada antes de iniciar la reparacion.";
  }

  if (status === "REPAIR_IN_PROGRESS") {
    return "Registra el trabajo realizado y marca la reparacion como terminada.";
  }

  if (status === "READY_FOR_PICKUP") {
    return "Contacta al cliente y cierra el ticket cuando el equipo haya sido entregado.";
  }

  if (status === "DELIVERED") {
    return "El ticket esta cerrado.";
  }

  if (status === "CANCELLED") {
    return "El ticket esta cancelado.";
  }

  return "Revisa el estado actual antes de continuar.";
}

function statusLabel(status: string, preferQuoteStatus = false) {
  if (isInvoiceStatus(status)) {
    if (preferQuoteStatus || !isTicketStatus(status)) {
      return quoteStatusLabel(status);
    }
  }

  if (isTicketStatus(status)) {
    return ticketStatusLabel(status);
  }

  return status;
}

function isTicketStatus(status: string): status is TicketStatus {
  return [
    "RECEIVED",
    "INITIAL_REVIEW",
    "DIAGNOSIS",
    "WAITING_APPROVAL",
    "APPROVED",
    "REPAIR_IN_PROGRESS",
    "READY_FOR_PICKUP",
    "DELIVERED",
    "CANCELLED",
  ].includes(status);
}

function isInvoiceStatus(status: string): status is InvoiceStatus {
  return [
    "DRAFT",
    "SENT",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
    "PAID",
    "PARTIALLY_PAID",
    "UNPAID",
  ].includes(status);
}

function ticketStatusLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Recibido",
    INITIAL_REVIEW: "Revision inicial",
    DIAGNOSIS: "Diagnostico",
    WAITING_APPROVAL: "Esperando aprobacion",
    APPROVED: "Listo para reparacion",
    REPAIR_IN_PROGRESS: "En reparacion",
    READY_FOR_PICKUP: "Listo para entrega",
    DELIVERED: "Cerrado",
    CANCELLED: "Cancelado",
  };

  return labels[status] ?? status;
}

function quoteStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
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

function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    UNPAID: "Pendiente",
    PARTIALLY_PAID: "Parcial",
    PAID: "Pagada",
    REFUNDED: "Reembolsada",
    VOID: "Anulada",
  };

  return labels[status] ?? status;
}
