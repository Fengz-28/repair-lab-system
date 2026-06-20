import "server-only";

import { getEmailConfig } from "./email-config";
import { DryRunEmailProvider } from "./dry-run-email-provider";
import { ResendEmailProvider } from "./resend-email-provider";
import type { TransactionalEmailInput, TransactionalEmailResult } from "./email.types";

export async function sendEmail(input: TransactionalEmailInput): Promise<TransactionalEmailResult> {
  const config = getEmailConfig();

  if (!config.notificationsEnabled || config.provider === "disabled") {
    return new DryRunEmailProvider(config.provider, true).send(input);
  }

  if (config.dryRun || config.provider === "console") {
    return new DryRunEmailProvider(config.provider).send(input);
  }

  if (config.provider === "resend") {
    return new ResendEmailProvider(config).send(input);
  }

  return {
    ok: false,
    provider: config.provider,
    dryRun: false,
    disabled: false,
    errorCode: "UNSUPPORTED_PROVIDER",
    errorMessage: "Unsupported email provider.",
  };
}
