"use server";

import { revalidatePath } from "next/cache";

import { requireLocalStaff } from "@/server/auth/local-admin";
import type { IntakeActionState } from "@/modules/intake/intake.action-state";
import { createIntakeSchema } from "@/modules/intake/intake.schema";
import { receiveDeviceForRepair } from "@/modules/intake/intake.service";

export async function createIntakeAction(
  _previousState: IntakeActionState,
  formData: FormData,
): Promise<IntakeActionState> {
  const session = await requireLocalStaff();

  const parsed = createIntakeSchema.safeParse({
    customer: {
      firstName: formData.get("customer.firstName"),
      lastName: formData.get("customer.lastName"),
      email: formData.get("customer.email"),
      phone: formData.get("customer.phone"),
      whatsappPhone: formData.get("customer.whatsappPhone"),
      preferredContactMethod: formData.get("customer.preferredContactMethod") || "WHATSAPP",
      notes: formData.get("customer.notes"),
    },
    device: {
      type: formData.get("device.type") || "OTHER",
      brand: formData.get("device.brand"),
      model: formData.get("device.model"),
      serial: formData.get("device.serial"),
      color: formData.get("device.color"),
      notes: formData.get("device.notes"),
    },
    intake: {
      accessoriesReceived: formData.get("intake.accessoriesReceived"),
      physicalCondition: formData.get("intake.physicalCondition"),
      reportedIssue: formData.get("intake.reportedIssue"),
      internalNotes: formData.get("intake.internalNotes"),
    },
    photos: formData
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)
      .map((file) => ({
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        byteSize: file.size,
      })),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados antes de registrar la recepcion.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await receiveDeviceForRepair(parsed.data, {
      actorUserId: session.userId,
    });

    revalidatePath("/admin/intake");

    return {
      ok: true,
      message: "Recepcion registrada y ticket creado.",
      ticketId: result.ticketId,
      ticketNumber: result.ticketNumber,
      receiptNumber: result.receiptNumber,
    };
  } catch (error) {
    console.error("createIntakeAction failed", error);

    return {
      ok: false,
      message: "No se pudo registrar la recepcion. Intentalo de nuevo.",
    };
  }
}
