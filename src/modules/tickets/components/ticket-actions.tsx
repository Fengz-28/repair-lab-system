"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TicketStatus } from "@prisma/client";

import {
  addInternalCommentAction,
  addTicketAttachmentPlaceholderAction,
  changeTicketStatusAction,
  convertQuoteToInvoiceAction,
  updateTechnicalNotesAction,
} from "@/app/admin/tickets/[ticketId]/actions";
import { initialTicketActionState } from "@/modules/tickets/ticket.action-state";

type StatusOption = {
  value: TicketStatus;
  label: string;
};

export function TicketGuidedActions({
  ticketId,
  currentStatus,
  allowedNextStatuses,
  hasApprovedQuote,
  hasResolution,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
  allowedNextStatuses: StatusOption[];
  hasApprovedQuote: boolean;
  hasResolution: boolean;
}) {
  const actions = allowedNextStatuses.map((status) => ({
    ...status,
    label: operationalActionLabel(status.value),
    comment: operationalActionComment(status.value),
    blockedReason: getOperationalBlockReason(status.value, {
      hasApprovedQuote,
      hasResolution,
    }),
  }));

  return (
    <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Acciones recomendadas
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Estado actual: {ticketStatusLabel(currentStatus)}
        </p>
      </div>
      {actions.length === 0 ? (
        <p className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Este ticket no tiene mas acciones operativas.
        </p>
      ) : (
        <div className="grid gap-2">
          {actions.map((action) => (
            <OperationalActionForm
              key={action.value}
              ticketId={ticketId}
              nextStatus={action.value}
              label={action.label}
              comment={action.comment}
              blockedReason={action.blockedReason}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function TicketStatusForm({
  ticketId,
  currentStatus,
  allowedNextStatuses,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
  allowedNextStatuses: StatusOption[];
}) {
  const [state, formAction] = useActionState(
    changeTicketStatusAction,
    initialTicketActionState,
  );
  const isFinal = allowedNextStatuses.length === 0;

  return (
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Cambiar estado</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Estado actual: {ticketStatusLabel(currentStatus)}
        </p>
      </div>
      {isFinal ? (
        <p className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Este ticket esta en estado final.
        </p>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Siguiente estado
            <select
              name="nextStatus"
              className="min-h-10 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {allowedNextStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Comentario interno opcional
            <textarea
              name="internalComment"
              rows={3}
              className="min-h-24 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <ActionMessage ok={state.ok} message={state.message} />
          <SubmitButton label="Actualizar estado" pendingLabel="Actualizando..." />
        </>
      )}
    </form>
  );
}

export function InternalCommentForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useActionState(
    addInternalCommentAction,
    initialTicketActionState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <input type="hidden" name="ticketId" value={ticketId} />
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Comentario interno</h2>
      <textarea
        name="body"
        rows={4}
        required
        className="min-h-24 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Agregar comentario" pendingLabel="Agregando..." />
    </form>
  );
}

export function TechnicalNotesForm({
  ticketId,
  diagnosis,
  resolution,
  internalNotes,
}: {
  ticketId: string;
  diagnosis: string;
  resolution: string;
  internalNotes: string;
}) {
  const [state, formAction] = useActionState(
    updateTechnicalNotesAction,
    initialTicketActionState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <input type="hidden" name="ticketId" value={ticketId} />
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Notas tecnicas</h2>
      <TextArea
        label="Diagnostico tecnico"
        name="diagnosis"
        defaultValue={diagnosis}
        helpText="Describe la causa probable, pruebas realizadas y hallazgos tecnicos."
      />
      <TextArea
        label="Trabajo realizado / resolucion"
        name="resolution"
        defaultValue={resolution}
        helpText="Registra las reparaciones realizadas, piezas usadas y resultado final."
      />
      <TextArea
        label="Observaciones internas"
        name="internalNotes"
        defaultValue={internalNotes}
        helpText="Anota detalles internos del taller que no son para el cliente."
      />
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Guardar notas" pendingLabel="Guardando..." />
    </form>
  );
}

export function AttachmentPlaceholderForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useActionState(
    addTicketAttachmentPlaceholderAction,
    initialTicketActionState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Archivo privado</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Sube un adjunto interno privado. No se publica ni expone al cliente.
        </p>
      </div>
      <input
        name="attachment"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="block w-full text-sm dark:text-zinc-100"
      />
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Agregar archivo" pendingLabel="Agregando..." />
    </form>
  );
}

export function GenerateInvoiceForm({
  ticketId,
  quoteId,
}: {
  ticketId: string;
  quoteId: string;
}) {
  const [state, formAction] = useActionState(
    convertQuoteToInvoiceAction,
    initialTicketActionState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <button
        type="submit"
        className="min-h-10 w-full rounded bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950 sm:w-auto"
      >
        Generar factura
      </button>
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  helpText,
}: {
  label: string;
  name: string;
  defaultValue: string;
  helpText: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {label}
      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{helpText}</span>
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue}
        className="min-h-24 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  );
}

function OperationalActionForm({
  ticketId,
  nextStatus,
  label,
  comment,
  blockedReason,
}: {
  ticketId: string;
  nextStatus: TicketStatus;
  label: string;
  comment: string;
  blockedReason?: string;
}) {
  const [state, formAction] = useActionState(
    changeTicketStatusAction,
    initialTicketActionState,
  );

  return (
    <form action={formAction} className="space-y-2 rounded border border-zinc-100 p-3 dark:border-zinc-800">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <input type="hidden" name="internalComment" value={comment} />
      {blockedReason ? (
        <p className="text-sm text-amber-700 dark:text-amber-200">{blockedReason}</p>
      ) : null}
      <button
        type="submit"
        disabled={Boolean(blockedReason)}
        className="min-h-10 w-full rounded bg-zinc-950 px-4 py-2 text-left text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:bg-zinc-100 dark:text-zinc-950 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-400"
      >
        {label}
      </button>
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function getOperationalBlockReason(
  nextStatus: TicketStatus,
  context: {
    hasApprovedQuote: boolean;
    hasResolution: boolean;
  },
) {
  if (nextStatus === "REPAIR_IN_PROGRESS" && !context.hasApprovedQuote) {
    return "Necesitas una cotizacion aprobada antes de iniciar la reparacion.";
  }

  if (nextStatus === "DELIVERED" && !context.hasResolution) {
    return "Registra el trabajo realizado antes de cerrar el ticket.";
  }

  return undefined;
}

function operationalActionLabel(status: TicketStatus) {
  const labels: Record<TicketStatus, string> = {
    RECEIVED: "Volver a recibido",
    INITIAL_REVIEW: "Enviar a revision inicial",
    DIAGNOSIS: "Enviar a diagnostico",
    WAITING_APPROVAL: "Esperar aprobacion",
    APPROVED: "Marcar listo para reparacion",
    REPAIR_IN_PROGRESS: "Iniciar reparacion",
    READY_FOR_PICKUP: "Marcar listo para entrega",
    DELIVERED: "Cerrar ticket",
    CANCELLED: "Cancelar ticket",
  };

  return labels[status] ?? status;
}

function operationalActionComment(status: TicketStatus) {
  const comments: Record<TicketStatus, string> = {
    RECEIVED: "Ticket marcado como recibido.",
    INITIAL_REVIEW: "Equipo enviado a revision inicial.",
    DIAGNOSIS: "Equipo enviado a diagnostico tecnico.",
    WAITING_APPROVAL: "Ticket en espera de aprobacion de cotizacion.",
    APPROVED: "Ticket listo para iniciar reparacion.",
    REPAIR_IN_PROGRESS: "Reparacion iniciada.",
    READY_FOR_PICKUP: "Reparacion terminada. Equipo listo para entrega.",
    DELIVERED: "Equipo entregado al cliente. Ticket cerrado.",
    CANCELLED: "Ticket cancelado.",
  };

  return comments[status] ?? "Estado actualizado.";
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

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-10 w-full rounded bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300 sm:w-auto"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`rounded border p-2 text-sm ${
        ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
      role="status"
    >
      {message}
    </p>
  );
}
