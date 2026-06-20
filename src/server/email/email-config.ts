import "server-only";

export type EmailProviderName = "resend" | "console" | "disabled";

export type EmailConfig = {
  provider: EmailProviderName;
  notificationsEnabled: boolean;
  dryRun: boolean;
  from: string;
  replyTo?: string;
  resendApiKey?: string;
};

export function getEmailConfig(): EmailConfig {
  return {
    provider: readProvider(process.env.EMAIL_PROVIDER),
    notificationsEnabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === "true",
    dryRun: process.env.EMAIL_DRY_RUN !== "false",
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || "",
    replyTo: optionalString(process.env.EMAIL_REPLY_TO),
    resendApiKey: optionalString(process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_KEY),
  };
}

function readProvider(value: string | undefined): EmailProviderName {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "resend" || normalized === "console" || normalized === "disabled") {
    return normalized;
  }

  return "disabled";
}

function optionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
