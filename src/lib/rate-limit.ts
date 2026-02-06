/**
 * In-memory sliding-window rate limiter.
 *
 * Each limiter tracks request timestamps per key (typically IP).
 * Old entries are pruned on every check to prevent memory leaks.
 */

interface RateLimitEntry {
  timestamps: number[];
}

export interface RateLimiterConfig {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /**
   * Check whether a request from `key` should be allowed.
   * Returns { allowed: true } or { allowed: false, retryAfterMs }.
   */
  check(key: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    // Prune timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      const oldest = entry.timestamps[0];
      const retryAfterMs = oldest + this.windowMs - now;
      return { allowed: false, retryAfterMs };
    }

    entry.timestamps.push(now);
    return { allowed: true };
  }
}

// ─── Pre-configured limiters ────────────────────────────────────

/** AI endpoints: 5 requests per 60 seconds per IP */
export const aiLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
});

/** General read endpoints: 30 requests per 60 seconds per IP */
export const readLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60_000,
});
