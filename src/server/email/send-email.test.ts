import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sendEmail } from "./send-email";

const ENV_KEYS = [
  "EMAIL_PROVIDER",
  "EMAIL_NOTIFICATIONS_ENABLED",
  "EMAIL_DRY_RUN",
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
  "RESEND_API_KEY",
  "EMAIL_PROVIDER_KEY",
] as const;

const input = {
  to: "cliente@example.com",
  subject: "ActualizaciÃƒÂ³n de reparaciÃƒÂ³n",
  text: "Tu ticket fue actualizado.",
  html: "<p>Tu ticket fue actualizado.</p>",
};

describe("sendEmail", () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();

    for (const key of ENV_KEYS) {
      const value = originalEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("does not call an external provider when notifications are disabled", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    process.env.EMAIL_PROVIDER = "resend";
    process.env.EMAIL_NOTIFICATIONS_ENABLED = "false";
    process.env.EMAIL_DRY_RUN = "false";

    const result = await sendEmail(input);

    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.dryRun).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call an external provider in dry-run mode", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    process.env.EMAIL_PROVIDER = "resend";
    process.env.EMAIL_NOTIFICATIONS_ENABLED = "true";
    process.env.EMAIL_DRY_RUN = "true";

    const result = await sendEmail(input);

    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(false);
    expect(result.dryRun).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails safely when Resend live mode is missing credentials", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    process.env.EMAIL_PROVIDER = "resend";
    process.env.EMAIL_NOTIFICATIONS_ENABLED = "true";
    process.env.EMAIL_DRY_RUN = "false";
    process.env.EMAIL_FROM = "FengzLab <updates@example.com>";

    const result = await sendEmail(input);

    expect(result.ok).toBe(false);
    expect(result.provider).toBe("resend");
    expect(result.errorCode).toBe("CONFIGURATION_ERROR");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends through Resend when live mode is explicitly configured", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "email_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    process.env.EMAIL_PROVIDER = "resend";
    process.env.EMAIL_NOTIFICATIONS_ENABLED = "true";
    process.env.EMAIL_DRY_RUN = "false";
    process.env.EMAIL_FROM = "FengzLab <updates@example.com>";
    process.env.EMAIL_REPLY_TO = "contacto@example.com";
    process.env.RESEND_API_KEY = "test-key";

    const result = await sendEmail(input);

    expect(result.ok).toBe(true);
    expect(result.providerMessageId).toBe("email_123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown as [string, RequestInit?][];
    expect(calls[0]?.[0]).toBe("https://api.resend.com/emails");
    expect(calls[0]?.[1]).toMatchObject({ method: "POST" });
  });
});
