export type TransactionalEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
};

export type TransactionalEmailResult = {
  ok: boolean;
  provider: string;
  dryRun: boolean;
  disabled: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
};
