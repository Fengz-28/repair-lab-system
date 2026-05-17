export type AutomationEvent = {
  id: string;
  type: string;
  aggregateType?: string;
  aggregateId?: string;
  payload: unknown;
};

export type AutomationDispatchResult = {
  status: "delivered" | "skipped" | "failed";
  error?: string;
};

export interface AutomationProvider {
  dispatch(event: AutomationEvent): Promise<AutomationDispatchResult>;
  verifySignature(rawBody: string, signature: string): Promise<boolean>;
}

export class DisabledAutomationProvider implements AutomationProvider {
  async dispatch(): Promise<AutomationDispatchResult> {
    return { status: "skipped", error: "Automation provider is disabled." };
  }

  async verifySignature(): Promise<boolean> {
    return false;
  }
}

