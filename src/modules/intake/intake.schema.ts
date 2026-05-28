import { DeviceType, PreferredContactMethod } from "@prisma/client";
import { z } from "zod";

import {
  allowedUploadMimeTypes,
  maxUploadFileSizeBytes,
  maxUploadFilesPerIntake,
} from "@/server/storage/private-storage";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const intakePhotoSchema = z.object({
  originalName: z.string().min(1).max(255),
  mimeType: z
    .string()
    .min(1)
    .refine((value) => allowedUploadMimeTypes().includes(value), "Tipo de archivo no permitido."),
  byteSize: z
    .number()
    .int()
    .positive()
    .max(maxUploadFileSizeBytes(), "El archivo supera el maximo permitido."),
  bytes: z.instanceof(Uint8Array),
});

export const createIntakeSchema = z.object({
  customer: z.object({
    firstName: z.preprocess(emptyToUndefined, z.string().min(1).max(100)),
    lastName: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    email: z.preprocess(emptyToUndefined, z.string().email().max(255).optional()),
    phone: z.preprocess(emptyToUndefined, z.string().max(40).optional()),
    whatsappPhone: z.preprocess(emptyToUndefined, z.string().max(40).optional()),
    preferredContactMethod: z.enum(PreferredContactMethod).default("WHATSAPP"),
    notes: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
  }),
  device: z.object({
    type: z.enum(DeviceType),
    brand: z.preprocess(emptyToUndefined, z.string().min(1).max(100)),
    model: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    serial: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
    color: z.preprocess(emptyToUndefined, z.string().max(60).optional()),
    notes: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
  }),
  intake: z.object({
    accessoriesReceived: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
    physicalCondition: z.preprocess(emptyToUndefined, z.string().min(1).max(2000)),
    reportedIssue: z.preprocess(emptyToUndefined, z.string().min(1).max(2000)),
    internalNotes: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  }),
  photos: z
    .array(intakePhotoSchema)
    .max(maxUploadFilesPerIntake(), "Se superó el máximo de archivos por recepción.")
    .default([]),
});

export type CreateIntakeInput = z.infer<typeof createIntakeSchema>;
