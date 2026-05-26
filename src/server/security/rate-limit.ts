import "server-only";

type RateLimitConfig = {
  windowSeconds: number;
  maxAttempts: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
};

const globalStore = globalThis as typeof globalThis & {
  repairLabRateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalStore.repairLabRateLimitStore ?? new Map<string, RateLimitEntry>();
globalStore.repairLabRateLimitStore = store;

export function isRateLimitEnabled() {
  return process.env.RATE_LIMIT_ENABLED !== "false";
}

export function loginRateLimitConfig(): RateLimitConfig {
  return {
    windowSeconds: readPositiveInt("RATE_LIMIT_LOGIN_WINDOW_SECONDS", 300),
    maxAttempts: readPositiveInt("RATE_LIMIT_LOGIN_MAX_ATTEMPTS", 5),
  };
}

export function publicRateLimitConfig(): RateLimitConfig {
  return {
    windowSeconds: readPositiveInt("RATE_LIMIT_PUBLIC_WINDOW_SECONDS", 60),
    maxAttempts: readPositiveInt("RATE_LIMIT_PUBLIC_MAX_REQUESTS", 120),
  };
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  if (!isRateLimitEnabled()) {
    return {
      allowed: true,
      limit: config.maxAttempts,
      remaining: config.maxAttempts,
      resetAt: new Date(now + config.windowSeconds * 1000),
      retryAfterSeconds: 0,
    };
  }

  const existing = store.get(key);
  const resetAt = existing && existing.resetAt > now ? existing.resetAt : now + config.windowSeconds * 1000;
  const count = existing && existing.resetAt > now ? existing.count + 1 : 1;

  store.set(key, { count, resetAt });

  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
  const remaining = Math.max(0, config.maxAttempts - count);

  return {
    allowed: count <= config.maxAttempts,
    limit: config.maxAttempts,
    remaining,
    resetAt: new Date(resetAt),
    retryAfterSeconds,
  };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}

function cleanupExpiredEntries(now: number) {
  if (store.size < 5000) {
    return;
  }

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function readPositiveInt(name: string, fallback: number) {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

