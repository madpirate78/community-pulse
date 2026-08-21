import { describe, test, expect, setSystemTime, afterEach } from "bun:test";
import { RateLimiter } from "@/lib/rate-limit";

const T0 = new Date("2026-01-01T00:00:00Z");

afterEach(() => {
  setSystemTime(); // restore real time
});

describe("RateLimiter", () => {
  test("allows requests under the limit", () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
  });

  test("blocks over the limit with a retry hint", () => {
    setSystemTime(T0);
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
    limiter.check("a");
    limiter.check("a");
    const result = limiter.check("a");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(1000);
    }
  });

  test("tracks keys independently", () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  test("window slides: allows again once old requests age out", () => {
    setSystemTime(T0);
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);

    setSystemTime(new Date(T0.getTime() + 1001));
    expect(limiter.check("a").allowed).toBe(true);
  });

  test("sweeps idle keys so the store doesn't grow unboundedly", () => {
    setSystemTime(T0);
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });
    limiter.check("stale-1");
    limiter.check("stale-2");
    expect(limiter.size).toBe(2);

    // Move past the window, then trigger the periodic sweep.
    setSystemTime(new Date(T0.getTime() + 2000));
    for (let i = 0; i < 100; i++) limiter.check("active");
    expect(limiter.size).toBe(1);
  });
});
