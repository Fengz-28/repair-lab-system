"use server";

import { revalidatePath } from "next/cache";

import { requireLocalStaff } from "@/server/auth/local-admin";
import type { TicketActionState } from "@/modules/tickets/ticket.action-state";
import {
  addInternalCommentSchema,
  changeTicketStatusSchema,
  ticketAttachmentPlaceholderSchema,
  updateTechnicalNotesSchema,
} from "@/modules/tickets/ticket.lifecycle.schema";
import {
  addInternalComment,
  addTicketAttachmentPlaceholder,
  changeTicketStatus,
  updateTechnicalNotes,
} from "@/modules/tickets/ticket.lifecycle.service";

export async function changeTicketStatusAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const session = await requireLocalStaff();

  const parsed = changeTicketStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    nextStatus: formData.get("nextStatus"),
    internalComment: formData.get("internalComment"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "No se pudo cambiar el estado. Revisa los campos.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await changeTicketStatus(parsed.data, session.userId);
    revalidatePath(`/admin/tickets/${parsed.data.ticketId}`);

    return {
      ok: true,
      message: "Estado actualizado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo cambiar el estado.",
    };
  }
}

export async function addInternalCommentAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const session = await requireLocalStaff();

  const parsed = addInternalCommentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "El comentario interno es requerido.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await addInternalComment(parsed.data, session.userId);
    revalidatePath(`/admin/tickets/${parsed.data.ticketId}`);

    return {
      ok: true,
      message: "Comentario agregado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo agregar el comentario.",
    };
  }
}

export async function updateTechnicalNotesAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const session = await requireLocalStaff();

  const parsed = updateTechnicalNotesSchema.safeParse({
    ticketId: formData.get("ticketId"),
    diagnosis: formData.get("diagnosis"),
    resolution: formData.get("resolution"),
    internalNotes: formData.get("internalNotes"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "No se pudieron guardar las notas tecnicas.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateTechnicalNotes(parsed.data, session.userId);
    revalidatePath(`/admin/tickets/${parsed.data.ticketId}`);

    return {
      ok: true,
      message: "Notas tecnicas actualizadas.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudieron guardar las notas.",
    };
  }
}

export async function addTicketAttachmentPlaceholderAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const session = await requireLocalStaff();
  const file = formData.get("attachment");

  const parsed = ticketAttachmentPlaceholderSchema.safeParse({
    ticketId: formData.get("ticketId"),
    originalName: file instanceof File ? file.name : "",
    mimeType: file instanceof File ? file.type || "application/octet-stream" : "",
    byteSize: file instanceof File ? file.size : 0,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Selecciona un archivo valido para adjuntar.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await addTicketAttachmentPlaceholder(parsed.data, session.userId);
    revalidatePath(`/admin/tickets/${parsed.data.ticketId}`);

    return {
      ok: true,
      message: "Attachment placeholder agregado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo agregar el attachment.",
    };
  }
}

