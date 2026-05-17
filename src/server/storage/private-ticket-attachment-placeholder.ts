export type TicketAttachmentPlaceholder = {
  originalName: string;
  mimeType: string;
  byteSize: number;
};

export type PreparedTicketAttachment = TicketAttachmentPlaceholder & {
  storageKey: string;
};

export function preparePrivateTicketAttachment(
  ticketId: string,
  attachment: TicketAttachmentPlaceholder,
): PreparedTicketAttachment {
  const safeName = attachment.originalName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return {
    ...attachment,
    storageKey: `private-placeholder/tickets/${ticketId}/${Date.now()}-${safeName}`,
  };
}

