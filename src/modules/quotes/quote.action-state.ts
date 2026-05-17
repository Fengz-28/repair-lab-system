export type QuoteActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialQuoteActionState: QuoteActionState = {
  ok: false,
  message: "",
};

