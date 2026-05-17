export type WhatsAppTemplateMessage = {
  to: string;
  templateName: string;
  locale: string;
  variables?: Record<string, string>;
};

export type WhatsAppTextMessage = {
  to: string;
  body: string;
  relatedTicketId?: string;
};

export type WhatsAppSendResult = {
  providerMessageId?: string;
  status: "queued" | "sent" | "failed";
  error?: string;
};

export interface WhatsAppProvider {
  sendText(message: WhatsAppTextMessage): Promise<WhatsAppSendResult>;
  sendTemplate(message: WhatsAppTemplateMessage): Promise<WhatsAppSendResult>;
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>;
}

export class DisabledWhatsAppProvider implements WhatsAppProvider {
  async sendText(): Promise<WhatsAppSendResult> {
    return { status: "failed", error: "WhatsApp provider is disabled." };
  }

  async sendTemplate(): Promise<WhatsAppSendResult> {
    return { status: "failed", error: "WhatsApp provider is disabled." };
  }

  async verifyWebhookSignature(): Promise<boolean> {
    return false;
  }
}

