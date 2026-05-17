import { TicketStatus } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const ticketIdSchema = z.string().min(1);

export const changeTicketStatusSchema = z.object({
  ticketId: ticketIdSchema,
  nextStatus: z.enum(TicketStatus),
  internalComment: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
});

export const addInternalCommentSchema = z.object({
  ticketId: ticketIdSchema,
  body: z.preprocess(emptyToUndefined, z.string().min(1).max(2000)),
});

export const updateTechnicalNotesSchema = z.object({
  ticketId: ticketIdSchema,
  diagnosis: z.preprocess(emptyToUndefined, z.string().max(3000).optional()),
  resolution: z.preprocess(emptyToUndefined, z.string().max(3000).optional()),
  internalNotes: z.preprocess(emptyToUndefined, z.string().max(3000).optional()),
});

export const ticketAttachmentPlaceholderSchema = z.object({
  ticketId: ticketIdSchema,
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  byteSize: z.number().int().positive().max(15 * 1024 * 1024),
});

export type ChangeTicketStatusInput = z.infer<typeof changeTicketStatusSchema>;
export type AddInternalCommentInput = z.infer<typeof addInternalCommentSchema>;
export type UpdateTechnicalNotesInput = z.infer<typeof updateTechnicalNotesSchema>;
export type TicketAttachmentPlaceholderInput = z.infer<
  typeof ticketAttachmentPlaceholderSchema
>;

