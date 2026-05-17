export type AICompletionInput = {
  system?: string;
  prompt: string;
  metadata?: Record<string, unknown>;
};

export type AICompletionResult = {
  text: string;
  model?: string;
  provider?: string;
};

export type EmbeddingInput = {
  text: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingResult = {
  embedding: number[];
  model?: string;
  provider?: string;
};

export interface AIProvider {
  complete(input: AICompletionInput): Promise<AICompletionResult>;
  embed(input: EmbeddingInput): Promise<EmbeddingResult>;
}

export class DisabledAIProvider implements AIProvider {
  async complete(): Promise<AICompletionResult> {
    return { text: "", provider: "disabled" };
  }

  async embed(): Promise<EmbeddingResult> {
    return { embedding: [], provider: "disabled" };
  }
}

