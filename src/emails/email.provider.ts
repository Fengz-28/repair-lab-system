export type EmailMessage = {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  relatedTicketId?: string;
};

export type EmailSendResult = {
  providerMessageId?: string;
  status: "queued" | "sent" | "failed";
  error?: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

export class DisabledEmailProvider implements EmailProvider {
  async send(): Promise<EmailSendResult> {
    return { status: "failed", error: "Email provider is disabled." };
  }
}

