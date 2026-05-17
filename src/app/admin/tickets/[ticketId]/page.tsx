import Link from "next/link";
import { notFound } from "next/navigation";
import type { TicketStatus } from "@prisma/client";

import {
  AttachmentPlaceholderForm,
  InternalCommentForm,
  TechnicalNotesForm,
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
    },
  });

  if (!ticket) {
    notFound();
  }

  const allowedNextStatuses = getAllowedNextStatuses(ticket.status).map((status) => ({
    value: status,
    label: status,
  }));

  const timelineItems = [
    ...ticket.statusHistory.map((entry) => ({
      id: entry.id,
      type: "status",
      title: `Estado: ${entry.fromStatus ?? "START"} -> ${entry.toStatus}`,
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
      title: event.type,
      description: undefined,
      createdAt: event.createdAt,
    })),
    ...ticket.files.map((file) => ({
      id: file.id,
      type: "file",
      title: `Attachment privado: ${file.originalName}`,
      description: `${file.mimeType}, ${file.byteSize} bytes`,
      createdAt: file.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <header className="space-y-2">
          <Link className="text-sm text-zinc-600 underline" href="/admin/intake">
            Volver a recepcion
          </Link>
          <p className="text-sm font-medium text-zinc-500">Ticket {ticket.ticketNumber}</p>
          <h1 className="text-2xl font-semibold text-zinc-950">{ticket.title}</h1>
          <p className="text-sm text-zinc-600">Estado actual: {ticket.status}</p>
          <Link className="text-sm text-zinc-600 underline" href={`/admin/tickets/${ticket.id}/quotes`}>
            Ver cotizaciones
          </Link>
        </header>

        <section className="grid gap-4 rounded border border-zinc-200 p-4 md:grid-cols-2">
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

        <TicketTimeline items={timelineItems} />

        <section className="space-y-3 rounded border border-zinc-200 p-4">
          <h2 className="text-base font-semibold text-zinc-950">Historial de estado</h2>
          <ul className="space-y-2 text-sm">
            {ticket.statusHistory.map((entry) => (
              <li key={entry.id} className="rounded border border-zinc-100 p-3">
                <p>
                  {entry.fromStatus ?? "START"} {"->"} {entry.toStatus}
                </p>
                <p className="text-zinc-500">{entry.createdAt.toLocaleString("es-CR")}</p>
                {entry.internalComment ? (
                  <p className="text-zinc-700">{entry.internalComment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 rounded border border-zinc-200 p-4">
          <h2 className="text-base font-semibold text-zinc-950">Attachments privados</h2>
          {ticket.files.length === 0 ? (
            <p className="text-sm text-zinc-500">No hay attachments registrados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {ticket.files.map((file) => (
                <li key={file.id} className="rounded border border-zinc-100 p-3">
                  <p className="font-medium">{file.originalName}</p>
                  <p className="text-zinc-500">{file.storageKey}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      <aside className="space-y-4">
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
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="text-sm text-zinc-900">{value}</p>
    </div>
  );
}
