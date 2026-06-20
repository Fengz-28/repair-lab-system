import "server-only";

import type { EmailProvider } from "./email-provider";
import type { TransactionalEmailInput, TransactionalEmailResult } from "./email.types";

export class DryRunEmailProvider implements EmailProvider {
  constructor(
    private readonly provider: string,
    private readonly disabled = false,
  ) {}

  async send(input: TransactionalEmailInput): Promise<TransactionalEmailResult> {
    console.info("Transactional email dry-run", {
      provider: this.provider,
      disabled: this.disabled,
      to: input.to,
      subject: input.subject,
    });

    return {
      ok: true,
      provider: this.provider,
      dryRun: !this.disabled,
      disabled: this.disabled,
      metadata: {
        previewOnly: true,
        reason: this.disabled ? "EMAIL_NOTIFICATIONS_ENABLED is not true" : "EMAIL_DRY_RUN is true",
      },
    };
  }
}
