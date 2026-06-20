import "server-only";

import type { EmailConfig } from "./email-config";
import type { EmailProvider } from "./email-provider";
import type { TransactionalEmailInput, TransactionalEmailResult } from "./email.types";

export class ResendEmailProvider implements EmailProvider {
  constructor(private readonly config: EmailConfig) {}

  async send(input: TransactionalEmailInput): Promise<TransactionalEmailResult> {
    if (!this.config.resendApiKey || !this.config.from) {
      return {
        ok: false,
        provider: "resend",
        dryRun: false,
        disabled: false,
        errorCode: "CONFIGURATION_ERROR",
        errorMessage: "Resend email is not configured. Set RESEND_API_KEY and EMAIL_FROM.",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.config.from,
          to: input.to,
          subject: input.subject,
          html: input.html ?? input.text,
          text: input.text,
          reply_to: input.replyTo ?? this.config.replyTo,
        }),
      });

      const body = (await response.json().catch(() => null)) as { id?: string } | null;

      if (!response.ok) {
        return {
          ok: false,
          provider: "resend",
          dryRun: false,
          disabled: false,
          errorCode: "PROVIDER_ERROR",
          errorMessage: `Resend failed with status ${response.status}.`,
        };
      }

      return {
        ok: true,
        provider: "resend",
        dryRun: false,
        disabled: false,
        providerMessageId: body?.id,
      };
    } catch {
      return {
        ok: false,
        provider: "resend",
        dryRun: false,
        disabled: false,
        errorCode: "PROVIDER_ERROR",
        errorMessage: "Resend request failed.",
      };
    }
  }
}
