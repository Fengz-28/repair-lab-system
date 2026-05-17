"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TicketStatus } from "@prisma/client";

import {
  addInternalCommentAction,
  addTicketAttachmentPlaceholderAction,
  changeTicketStatusAction,
  updateTechnicalNotesAction,
} from "@/app/admin/tickets/[ticketId]/actions";
import { initialTicketActionState } from "@/modules/tickets/ticket.action-state";

type StatusOption = {
  value: TicketStatus;
  label: string;
};

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
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <h2 className="text-base font-semibold text-zinc-950">Cambiar estado</h2>
        <p className="text-sm text-zinc-600">Estado actual: {currentStatus}</p>
      </div>
      {isFinal ? (
        <p className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
          Este ticket esta en estado final.
        </p>
      ) : (
        <>
          <label className="grid gap-2 text-sm font-medium text-zinc-800">
            Siguiente estado
            <select
              name="nextStatus"
              className="min-h-10 rounded border border-zinc-300 px-3 py-2 text-sm"
            >
              {allowedNextStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800">
            Comentario interno opcional
            <textarea
              name="internalComment"
              rows={3}
              className="rounded border border-zinc-300 px-3 py-2 text-sm"
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
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <h2 className="text-base font-semibold text-zinc-950">Comentario interno</h2>
      <textarea
        name="body"
        rows={4}
        required
        className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
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
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <h2 className="text-base font-semibold text-zinc-950">Notas tecnicas</h2>
      <TextArea label="Diagnostico" name="diagnosis" defaultValue={diagnosis} />
      <TextArea label="Resolucion" name="resolution" defaultValue={resolution} />
      <TextArea label="Notas internas" name="internalNotes" defaultValue={internalNotes} />
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
    <form action={formAction} className="space-y-3 rounded border border-zinc-200 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div>
        <h2 className="text-base font-semibold text-zinc-950">Attachment placeholder</h2>
        <p className="text-sm text-zinc-600">
          Registra metadata privada. No publica ni expone archivos.
        </p>
      </div>
      <input name="attachment" type="file" className="block w-full text-sm" />
      <ActionMessage ok={state.ok} message={state.message} />
      <SubmitButton label="Agregar attachment" pendingLabel="Agregando..." />
    </form>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      {label}
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue}
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
    </label>
  );
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
      className="rounded bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
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

