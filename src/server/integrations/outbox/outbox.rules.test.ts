import { describe, expect, it } from "vitest";

import { retryDelayMilliseconds, unsupportedEventResult } from "./outbox.rules.mjs";

describe("outbox worker rules", () => {
  it("calculates capped retry backoff", () => {
    expect(retryDelayMilliseconds(1)).toBe(60_000);
    expect(retryDelayMilliseconds(2)).toBe(120_000);
    expect(retryDelayMilliseconds(3)).toBe(240_000);
    expect(retryDelayMilliseconds(20)).toBe(3_600_000);
  });

  it("returns a safe unsupported event result", () => {
    expect(unsupportedEventResult("unknown.event")).toEqual({
      status: "cancelled",
      reason: "Unsupported integration event type: unknown.event",
    });
  });
});
