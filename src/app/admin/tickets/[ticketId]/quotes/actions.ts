"use server";

import { revalidatePath } from "next/cache";

import { requireLocalStaff, UserRole } from "@/server/auth/local-admin";
import type { QuoteActionState } from "@/modules/quotes/quote.action-state";
import {
  addQuoteItemSchema,
  changeQuoteStatusSchema,
  createQuoteSchema,
} from "@/modules/quotes/quote.schema";
import { addQuoteItem, changeQuoteStatus, createQuote } from "@/modules/quotes/quote.service";

export async function createQuoteAction(
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const session = await requireLocalStaff({
    roles: [UserRole.ADMIN, UserRole.TECHNICIAN],
  });

  const parsed = createQuoteSchema.safeParse({
    ticketId: formData.get("ticketId"),
    customerNotes: formData.get("customerNotes"),
    internalNotes: formData.get("internalNotes"),
    expiresInDays: formData.get("expiresInDays") || 15,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos de la cotizacion.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createQuote(parsed.data, {
      actorUserId: session.userId,
    });
    revalidatePath(`/admin/tickets/${parsed.data.ticketId}/quotes`);

    return {
      ok: true,
      message: "Cotizacion creada.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo crear la cotizacion.",
    };
  }
}

export async function addQuoteItemAction(
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const session = await requireLocalStaff({
    roles: [UserRole.ADMIN, UserRole.TECHNICIAN],
  });
  const ticketId = String(formData.get("ticketId") ?? "");

  const parsed = addQuoteItemSchema.safeParse({
    quoteId: formData.get("quoteId"),
    catalogItemId: formData.get("catalogItemId"),
    itemType: formData.get("itemType") || "SERVICE",
    description: formData.get("description"),
    quantity: formData.get("quantity") || 1,
    unitPrice: formData.get("unitPrice"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa la linea de cotizacion.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await addQuoteItem(parsed.data, {
      actorUserId: session.userId,
    });
    revalidatePath(`/admin/tickets/${ticketId}/quotes`);

    return {
      ok: true,
      message: "Linea agregada.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo agregar la linea.",
    };
  }
}

export async function changeQuoteStatusAction(
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const session = await requireLocalStaff({
    roles: [UserRole.ADMIN, UserRole.TECHNICIAN],
  });
  const ticketId = String(formData.get("ticketId") ?? "");

  const parsed = changeQuoteStatusSchema.safeParse({
    quoteId: formData.get("quoteId"),
    nextStatus: formData.get("nextStatus"),
    internalComment: formData.get("internalComment"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "No se pudo cambiar el estado de la cotizacion.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await changeQuoteStatus(parsed.data, {
      actorUserId: session.userId,
    });
    revalidatePath(`/admin/tickets/${ticketId}/quotes`);
    revalidatePath(`/admin/tickets/${ticketId}`);

    return {
      ok: true,
      message: "Estado de cotizacion actualizado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo cambiar el estado.",
    };
  }
}
