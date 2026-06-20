import { describe, expect, it } from "vitest";

import { renderTransactionalEmail } from "./email.templates";

describe("transactional email templates", () => {
  it("renders a customer-facing ticket update with portal link", () => {
    const email = renderTransactionalEmail("ticket.status_changed", {
      ticketNumber: "TK-1001",
      toStatusLabel: "Diagnóstico listo",
      portalUrl: "https://staging.fengzlab.tech/track/token-123",
    });

    expect(email.subject).toContain("Actualización de reparación");
    expect(email.text).toContain("TK-1001");
    expect(email.text).toContain("https://staging.fengzlab.tech/track/token-123");
    expect(email.html).toContain("FengzLab");
  });

  it("does not expose internal notes or private file paths from extra data", () => {
    const email = renderTransactionalEmail("ticket.status_changed", {
      ticketNumber: "TK-1002",
      toStatusLabel: "En reparación",
      portalUrl: "https://staging.fengzlab.tech/track/token-456",
      internalComment: "Cliente complicado, revisar margen interno",
      privateFilePath: "C:\\Users\\PC MASTER\\repair-lab-system\\storage\\private\\foto.jpg",
      stackTrace: "Error: private stack trace",
    });

    const combined = `${email.subject}\n${email.text}\n${email.html}`;

    expect(combined).not.toContain("Cliente complicado");
    expect(combined).not.toContain("storage\\private");
    expect(combined).not.toContain("private stack trace");
    expect(combined).not.toContain("Repair Lab");
    expect(combined).not.toContain("Ã");
  });
});
