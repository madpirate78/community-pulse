import { describe, test, expect } from "bun:test";
import { withRetry, isRetryableStatus } from "@/lib/retry";

/** Millisecond delays so retry tests stay fast. */
const FAST = [1, 1, 1];

function failingWith(status: number | undefined, failures: number) {
  let calls = 0;
  const fn = async () => {
    calls++;
    if (calls <= failures) throw Object.assign(new Error("boom"), { status });
    return "ok";
  };
  return { fn, callCount: () => calls };
}

describe("isRetryableStatus", () => {
  test("only 429 and 503 are retryable", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(500)).toBe(false);
    expect(isRetryableStatus(undefined)).toBe(false);
  });
});

describe("withRetry", () => {
  test("returns the result on first success", async () => {
    const { fn, callCount } = failingWith(503, 0);
    expect(await withRetry(fn, "test", FAST)).toBe("ok");
    expect(callCount()).toBe(1);
  });

  test("retries transient errors until success", async () => {
    const { fn, callCount } = failingWith(503, 2);
    expect(await withRetry(fn, "test", FAST)).toBe("ok");
    expect(callCount()).toBe(3);
  });

  test("throws non-retryable errors immediately", async () => {
    const { fn, callCount } = failingWith(500, 5);
    await expect(withRetry(fn, "test", FAST)).rejects.toThrow("boom");
    expect(callCount()).toBe(1);
  });

  test("gives up once the delays are exhausted", async () => {
    const { fn, callCount } = failingWith(429, 10);
    await expect(withRetry(fn, "test", FAST)).rejects.toThrow("boom");
    expect(callCount()).toBe(FAST.length + 1);
  });
});
