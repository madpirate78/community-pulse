/**
 * In-memory sliding-window rate limiter.
 *
 * Each limiter tracks request timestamps per key (typically IP). Stale
 * timestamps are pruned on every check, and idle keys are swept out
 * periodically so the map doesn't grow with every IP ever seen.
 */

import { config } from "@/config";

interface RateLimitEntry {
  timestamps: number[];
}

export interface RateLimiterConfig {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

/** Sweep idle keys once per this many checks. */
const SWEEP_INTERVAL = 100;

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private checksSinceSweep = 0;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /** Number of keys currently tracked (exposed for tests). */
  get size(): number {
    return this.store.size;
  }

  /**
   * Check whether a request from `key` should be allowed.
   * Returns { allowed: true } or { allowed: false, retryAfterMs }.
   */
  check(key: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (++this.checksSinceSweep >= SWEEP_INTERVAL) {
      this.checksSinceSweep = 0;
      this.sweep(windowStart);
    }

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

  /** Drop keys whose requests have all left the window. */
  private sweep(windowStart: number) {
    for (const [key, entry] of this.store) {
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
      if (entry.timestamps.length === 0) this.store.delete(key);
    }
  }
}

// ─── Pre-configured limiters (tuned in config.operational.rateLimits) ───

/** AI endpoints. */
export const aiLimiter = new RateLimiter(config.operational.rateLimits.ai);

/** General read endpoints. */
export const readLimiter = new RateLimiter(config.operational.rateLimits.read);

/** Form submissions. */
export const submitLimiter = new RateLimiter(
  config.operational.rateLimits.submit
);
