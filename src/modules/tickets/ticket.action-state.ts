export type TicketActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialTicketActionState: TicketActionState = {
  ok: false,
  message: "",
};

