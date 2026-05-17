export type IntakeActionState = {
  ok: boolean;
  message: string;
  ticketNumber?: string;
  receiptNumber?: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialIntakeActionState: IntakeActionState = {
  ok: false,
  message: "",
};

