import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  checkRateLimit,
  loginRateLimitConfig,
  publicRateLimitConfig,
  resetRateLimit,
} from "./rate-limit";

describe("rate limit helpers", () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_ENABLED;
    delete process.env.RATE_LIMIT_LOGIN_WINDOW_SECONDS;
    delete process.env.RATE_LIMIT_LOGIN_MAX_ATTEMPTS;
    delete process.env.RATE_LIMIT_PUBLIC_WINDOW_SECONDS;
    delete process.env.RATE_LIMIT_PUBLIC_MAX_REQUESTS;
    resetRateLimit("test:key");
    vi.useRealTimers();
  });

  it("limits requests after the configured maximum", () => {
    const config = { windowSeconds: 60, maxAttempts: 2 };

    expect(checkRateLimit("test:key", config).allowed).toBe(true);
    expect(checkRateLimit("test:key", config).allowed).toBe(true);

    const third = checkRateLimit("test:key", config);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets a key explicitly", () => {
    const config = { windowSeconds: 60, maxAttempts: 1 };

    expect(checkRateLimit("test:key", config).allowed).toBe(true);
    expect(checkRateLimit("test:key", config).allowed).toBe(false);

    resetRateLimit("test:key");

    expect(checkRateLimit("test:key", config).allowed).toBe(true);
  });

  it("can be disabled for local troubleshooting", () => {
    process.env.RATE_LIMIT_ENABLED = "false";
    const config = { windowSeconds: 60, maxAttempts: 1 };

    expect(checkRateLimit("test:key", config).allowed).toBe(true);
    expect(checkRateLimit("test:key", config).allowed).toBe(true);
  });

  it("reads positive env overrides and ignores invalid values", () => {
    process.env.RATE_LIMIT_LOGIN_WINDOW_SECONDS = "120";
    process.env.RATE_LIMIT_LOGIN_MAX_ATTEMPTS = "7";
    process.env.RATE_LIMIT_PUBLIC_WINDOW_SECONDS = "-1";
    process.env.RATE_LIMIT_PUBLIC_MAX_REQUESTS = "not-a-number";

    expect(loginRateLimitConfig()).toEqual({
      windowSeconds: 120,
      maxAttempts: 7,
    });
    expect(publicRateLimitConfig()).toEqual({
      windowSeconds: 60,
      maxAttempts: 120,
    });
  });
});
