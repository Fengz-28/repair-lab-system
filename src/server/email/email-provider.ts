import type { TransactionalEmailInput, TransactionalEmailResult } from "./email.types";

export interface EmailProvider {
  send(input: TransactionalEmailInput): Promise<TransactionalEmailResult>;
}
