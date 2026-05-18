"use server";

import { revalidatePath } from "next/cache";

import { registerManualPaymentSchema } from "@/modules/payments/payment.schema";
import { registerManualPayment } from "@/modules/payments/payment.service";
import type { TicketActionState } from "@/modules/tickets/ticket.action-state";
import { requireLocalStaff } from "@/server/auth/local-admin";

export async function registerManualPaymentAction(
  _previousState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const session = await requireLocalStaff();
  const ticketId = String(formData.get("ticketId") ?? "");
  const invoiceId = String(formData.get("invoiceId") ?? "");

  const parsed = registerManualPaymentSchema.safeParse({
    invoiceId,
    amount: formData.get("amount"),
    method: formData.get("method"),
    reference: formData.get("reference"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos del pago.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await registerManualPayment(parsed.data, {
      actorUserId: session.userId,
    });

    revalidatePath(`/admin/tickets/${ticketId}/invoices/${invoiceId}`);
    revalidatePath(`/admin/tickets/${ticketId}`);

    return {
      ok: true,
      message: "Pago registrado.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo registrar el pago.",
    };
  }
}
