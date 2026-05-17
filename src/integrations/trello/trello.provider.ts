export type TrelloCardInput = {
  title: string;
  description?: string;
  labels?: string[];
  relatedTicketId?: string;
};

export type TrelloCardResult = {
  externalCardId?: string;
  status: "created" | "failed" | "skipped";
  error?: string;
};

export interface TrelloProvider {
  createCard(input: TrelloCardInput): Promise<TrelloCardResult>;
}

export class DisabledTrelloProvider implements TrelloProvider {
  async createCard(): Promise<TrelloCardResult> {
    return { status: "skipped", error: "Trello provider is disabled." };
  }
}

