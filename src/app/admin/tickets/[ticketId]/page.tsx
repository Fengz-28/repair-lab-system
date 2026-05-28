import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import type { InvoiceStatus, PaymentStatus, TicketStatus } from "@prisma/client";

import { AdminNav } from "@/components/admin-nav";
import { ActivityFeed } from "@/components/repairlab/activity-feed";
import { FinancialSummaryCard } from "@/components/repairlab/financial-summary-card";
import { TechnicalNotesPanel } from "@/components/repairlab/technical-notes-panel";
import { TicketCustomerCard } from "@/components/repairlab/ticket-customer-card";
import { TicketDeviceCard } from "@/components/repairlab/ticket-device-card";
import { TicketHero } from "@/components/repairlab/ticket-hero";
import { TicketSidebar, TicketSidebarCard } from "@/components/repairlab/ticket-sidebar";
import { RepairTicketTimeline, TimelineStageRail } from "@/components/repairlab/ticket-timeline";
import {
  RepairBadge,
  RepairButton,
  RepairContainer,
  RepairFloatingPanel,
  RepairGrid,
  RepairPageShell,
} from "@/components/repairlab";
import {
  messageStatusLabel,
  providerLabel,
  templateLabel,
} from "@/modules/messages/message-labels";
import { parseMessageMetadata } from "@/modules/messages/message-metadata";
import {
  AttachmentPlaceholderForm,
  GenerateInvoiceForm,
  InternalCommentForm,
  TechnicalNotesForm,
  TicketGuidedActions,
  TicketStatusForm,
} from "@/modules/tickets/components/ticket-actions";
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
      messages: {
        orderBy: { createdAt: "desc" },
        take: 5,
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
  const customerName = `${ticket.customer.firstName} ${ticket.customer.lastName ?? ""}`.trim();
  const deviceLabel = `${ticket.device.brand} ${ticket.device.model ?? ""}`.trim();

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
  const visualTimelineItems = timelineItems.map((item) => ({
    ...item,
    tone: timelineTone(item.type, item.title),
  }));

  return (
    <RepairPageShell>
      <AdminNav />
      <TicketHero
        ticketNumber={ticket.ticketNumber}
        title={ticket.title}
        customerName={customerName}
        deviceLabel={deviceLabel}
        status={ticketStatusLabel(ticket.status)}
        createdAt={ticket.createdAt}
      >
        <TimelineStageRail stages={ticketWorkflowStages(ticket.status)} />
      </TicketHero>

      <RepairContainer className="py-8 sm:py-10">
        <RepairGrid className="gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(320px,4fr)]">
          <section className="space-y-6">
            <RepairFloatingPanel className="border-emerald-300/20 bg-emerald-500/10 text-emerald-100 shadow-emerald-950/10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Siguiente paso recomendado
              </p>
              <p className="mt-2 text-sm leading-6">{getRecommendedTicketStep(ticket.status, Boolean(approvedQuote))}</p>
            </RepairFloatingPanel>

            <RepairTicketTimeline items={visualTimelineItems} />

            <RepairGrid className="gap-6 xl:grid-cols-2">
              <TicketCustomerCard
                name={customerName}
                phone={ticket.customer.phone ?? "No registrado"}
                whatsapp={ticket.customer.whatsappPhone ?? "No registrado"}
                email={ticket.customer.email ?? "No registrado"}
              />
              <TicketDeviceCard
                device={deviceLabel}
                serial={ticket.device.serial ?? "No registrado"}
                issue={ticket.reportedIssue}
                condition={ticket.intake?.physicalCondition ?? "Sin intake asociado"}
              />
            </RepairGrid>

            <FinancialSummaryCard
              title="Cotizaciones"
              number={quotes[0]?.invoiceNumber ?? "Sin cotizacion"}
              total={quotes[0] ? `${quotes[0].currency} ${quotes[0].total.toString()}` : undefined}
              status={quotes[0] ? quoteStatusLabel(quotes[0].status) : undefined}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {quotes.length === 0
                      ? "No hay cotizaciones. Cuando el diagnostico tenga precio, crea una cotizacion."
                      : `${quotes.length} cotizacion(es) registradas.`}
                  </p>
                  <RepairButton href={`/admin/tickets/${ticket.id}/quotes`} tone="secondary" size="sm">
                    Abrir cotizaciones
                  </RepairButton>
                </div>
                {quotes.length > 0 ? (
                  <ul className="space-y-2">
                    {quotes.map((quote) => (
                      <li key={quote.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-sm shadow-sm shadow-black/20 transition hover:border-cyan-300/30 hover:bg-zinc-900/80">
                        <div className="min-w-0">
                          <p className="font-black text-zinc-950 dark:text-zinc-50">{quote.invoiceNumber}</p>
                          <p className="text-zinc-500 dark:text-zinc-400">
                            Creada: {quote.createdAt.toLocaleString("es-CR")}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge label="Cotizacion" value={quoteStatusLabel(quote.status)} tone="quote" />
                          <a className="text-sm font-bold text-emerald-700 underline dark:text-emerald-300" href={`/admin/tickets/${ticket.id}/quotes/${quote.id}/pdf`}>
                            PDF
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </FinancialSummaryCard>

            <FinancialSummaryCard
              title="Factura interna"
              number={generatedInvoice?.invoiceNumber ?? (approvedQuote ? `Cotizacion aprobada: ${approvedQuote.invoiceNumber}` : "Sin factura")}
              total={generatedInvoice ? `${generatedInvoice.currency} ${generatedInvoice.total.toString()}` : approvedQuote ? `${approvedQuote.currency} ${approvedQuote.total.toString()}` : undefined}
              status={generatedInvoice ? paymentStatusLabel(generatedInvoice.paymentStatus) : undefined}
            >
              {generatedInvoice ? (
                <div className="flex flex-wrap items-center gap-2">
                  <RepairButton href={`/admin/tickets/${ticket.id}/invoices/${generatedInvoice.id}`} tone="secondary" size="sm">
                    Ver factura
                  </RepairButton>
                  <a className="min-h-10 rounded-full border border-white/15 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-100 transition hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white" href={`/admin/tickets/${ticket.id}/invoices/${generatedInvoice.id}/pdf`}>
                    PDF factura
                  </a>
                </div>
              ) : approvedQuote ? (
                canGenerateInvoice ? (
                  <GenerateInvoiceForm ticketId={ticket.id} quoteId={approvedQuote.id} />
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    La factura no puede generarse hasta que la cotizacion tenga lineas y total mayor a cero.
                  </p>
                )
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  La factura se podra generar cuando exista una cotizacion aprobada.
                </p>
              )}
            </FinancialSummaryCard>

            <ActivityFeed title="Mensajes enviados" eyebrow="Comunicaciones" empty={ticket.messages.length === 0}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="text-sm text-zinc-600 underline dark:text-zinc-300" href={`/admin/messages?search=${encodeURIComponent(ticket.ticketNumber)}`}>
              Ver historial
            </Link>
          </div>
          {ticket.messages.length > 0 ? (
            <ul className="space-y-2">
              {ticket.messages.map((message) => {
                const metadata = parseMessageMetadata(message.metadata);

                return (
                  <li
                    key={message.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/75 p-3 text-sm shadow-sm shadow-black/20 transition hover:border-cyan-300/30 hover:bg-zinc-900/80"
                  >
                    <div className="min-w-0">
                      <Link className="break-words font-medium text-zinc-950 underline dark:text-zinc-50" href={`/admin/messages/${message.id}`}>
                        {message.subject ?? "Sin asunto"}
                      </Link>
                      <p className="break-words text-zinc-500 dark:text-zinc-400">
                        {message.recipient ?? "Sin destinatario"} / {message.createdAt.toLocaleString("es-CR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-200">
                        {templateLabel(metadata.template)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-200">
                        {providerLabel(message.provider)}
                      </span>
                      <span className="rounded border border-cyan-400/30 bg-cyan-500/15 px-2 py-1 text-xs font-medium text-cyan-100">
                        {messageStatusLabel(message.status, message.provider)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay mensajes registrados para este ticket.</p>
          )}
            </ActivityFeed>

            <ActivityFeed title="Historial de estado" eyebrow="Estados" empty={ticket.statusHistory.length === 0}>
              <ul className="space-y-2 text-sm">
                {ticket.statusHistory.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 shadow-sm shadow-black/20 transition hover:border-cyan-300/30 hover:bg-zinc-900/80">
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
            </ActivityFeed>

            <ActivityFeed title="Archivos privados" eyebrow="Adjuntos" empty={ticket.files.length === 0}>
              <ul className="space-y-2 text-sm">
                {ticket.files.map((file) => (
                  <li key={file.id} className="rounded-2xl border border-white/10 bg-zinc-950/75 p-3 shadow-sm shadow-black/20 transition hover:border-cyan-300/30 hover:bg-zinc-900/80">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-medium">{file.originalName}</p>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          {file.mimeType} / {formatBytes(file.byteSize)}
                        </p>
                      </div>
                      <a
                        className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-100 transition hover:bg-emerald-500/20"
                        href={`/admin/files/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir archivo
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </ActivityFeed>
          </section>

          <TicketSidebar>
            <TicketSidebarCard title="Estado actual" eyebrow="Operacion">
              <div className="space-y-3">
                <StatusBadge label="Ticket" value={ticketStatusLabel(ticket.status)} tone="ticket" />
                {quotes[0] ? <StatusBadge label="Cotizacion" value={quoteStatusLabel(quotes[0].status)} tone="quote" /> : null}
                {generatedInvoice ? <StatusBadge label="Pago" value={paymentStatusLabel(generatedInvoice.paymentStatus)} tone="invoice" /> : null}
              </div>
            </TicketSidebarCard>

            <TicketSidebarCard title="Acciones rapidas" eyebrow="Workflow">
              <div className="space-y-4">
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
              </div>
            </TicketSidebarCard>

            <TicketSidebarCard title="Portal del cliente" eyebrow="Publico">
              <div className="space-y-3">
                <RepairBadge tone="emerald">Disponible</RepairBadge>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Comparte este enlace con el cliente para consultar el estado.
                </p>
                <a className="block break-all rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-100 underline transition hover:border-emerald-300/45 hover:bg-emerald-500/15" href={`/track/${ticket.publicAccessToken}`} target="_blank" rel="noreferrer">
                  /track/{ticket.publicAccessToken}
                </a>
              </div>
            </TicketSidebarCard>

            <TicketSidebarCard title="Descargas" eyebrow="PDFs">
              <div className="grid gap-2">
                {quotes[0] ? (
                  <a className="min-h-10 rounded-full border border-white/15 bg-zinc-800 px-4 py-2 text-center text-xs font-bold text-zinc-100 transition hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white" href={`/admin/tickets/${ticket.id}/quotes/${quotes[0].id}/pdf`}>
                    PDF cotizacion
                  </a>
                ) : null}
                {generatedInvoice ? (
                  <a className="min-h-10 rounded-full border border-white/15 bg-zinc-800 px-4 py-2 text-center text-xs font-bold text-zinc-100 transition hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white" href={`/admin/tickets/${ticket.id}/invoices/${generatedInvoice.id}/pdf`}>
                    PDF factura
                  </a>
                ) : null}
                {!quotes[0] && !generatedInvoice ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay PDFs disponibles todavia.</p>
                ) : null}
              </div>
            </TicketSidebarCard>

            <TechnicalNotesPanel>
              <TechnicalNotesForm
                ticketId={ticket.id}
                diagnosis={ticket.diagnosis ?? ""}
                resolution={ticket.resolution ?? ""}
                internalNotes={ticket.internalNotes ?? ""}
              />
            </TechnicalNotesPanel>

            <TicketSidebarCard title="Comentarios y archivos" eyebrow="Interno">
              <div className="space-y-4">
                <InternalCommentForm ticketId={ticket.id} />
                <AttachmentPlaceholderForm ticketId={ticket.id} />
              </div>
            </TicketSidebarCard>
          </TicketSidebar>
        </RepairGrid>
      </RepairContainer>
    </RepairPageShell>
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
    ticket: "border-violet-400/35 bg-violet-500/15 text-violet-100",
    quote: "border-cyan-400/35 bg-cyan-500/15 text-cyan-100",
    invoice: "border-emerald-400/35 bg-emerald-500/15 text-emerald-100",
  }[tone];
  const dotClasses = {
    ticket: "bg-violet-300",
    quote: "bg-cyan-300",
    invoice: "bg-emerald-300",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold shadow-sm shadow-black/20 ${classes}`}>
      <span className={`size-1.5 rounded-full ${dotClasses}`} />
      <span className="uppercase">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function ticketWorkflowStages(currentStatus: TicketStatus) {
  const stages: { status: TicketStatus; label: string }[] = [
    { status: "RECEIVED", label: "Recibido" },
    { status: "DIAGNOSIS", label: "Diagnostico" },
    { status: "WAITING_APPROVAL", label: "Aprobacion" },
    { status: "APPROVED", label: "Aprobado" },
    { status: "REPAIR_IN_PROGRESS", label: "Reparacion" },
    { status: "READY_FOR_PICKUP", label: "Listo entrega" },
    { status: "DELIVERED", label: "Entregado" },
  ];
  const currentIndex = stages.findIndex((stage) => stage.status === currentStatus);

  return stages.map((stage, index) => ({
    label: stage.label,
    active: stage.status === currentStatus,
    done: currentIndex > -1 && index < currentIndex,
  }));
}

function timelineTone(type: string, title: string) {
  if (title.includes("aprob") || title.includes("Listo") || title.includes("cerrado")) {
    return "emerald" as const;
  }

  if (title.includes("Diagnostico") || title.includes("Reparacion")) {
    return "cyan" as const;
  }

  if (title.includes("Esperando") || title.includes("enviada")) {
    return "warning" as const;
  }

  if (type === "comment") {
    return "violet" as const;
  }

  return "neutral" as const;
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

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
