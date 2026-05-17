export type CalendarAppointment = {
  id: string;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  attendeeEmail?: string;
};

export type CalendarSyncResult = {
  externalEventId?: string;
  status: "created" | "updated" | "cancelled" | "failed";
  error?: string;
};

export interface CalendarProvider {
  createEvent(appointment: CalendarAppointment): Promise<CalendarSyncResult>;
  updateEvent(externalEventId: string, appointment: CalendarAppointment): Promise<CalendarSyncResult>;
  cancelEvent(externalEventId: string): Promise<CalendarSyncResult>;
}

export class DisabledCalendarProvider implements CalendarProvider {
  async createEvent(): Promise<CalendarSyncResult> {
    return { status: "failed", error: "Calendar provider is disabled." };
  }

  async updateEvent(): Promise<CalendarSyncResult> {
    return { status: "failed", error: "Calendar provider is disabled." };
  }

  async cancelEvent(): Promise<CalendarSyncResult> {
    return { status: "failed", error: "Calendar provider is disabled." };
  }
}

