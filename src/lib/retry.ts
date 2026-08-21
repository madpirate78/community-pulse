/** Shared retry infrastructure for AI API calls. */

import { log } from "./logger";

/** Backoff delay before each retry; the array length is the retry budget. */
export const RETRY_DELAYS = [5_000, 15_000, 30_000];

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Status codes that indicate a transient overload — safe to retry. */
export function isRetryableStatus(status: unknown): boolean {
  return status === 503 || status === 429;
}

/**
 * Run `fn`, retrying on transient AI-service errors (429/503) with
 * backoff. Non-retryable errors are rethrown immediately; retryable
 * ones are rethrown once the delays are exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;
      if (!isRetryableStatus(status) || attempt >= RETRY_DELAYS.length) {
        throw error;
      }
      const delay = RETRY_DELAYS[attempt];
      log.info(
        `${label}: model busy (${status}), retrying in ${delay / 1000}s (attempt ${attempt + 1}/${RETRY_DELAYS.length})`
      );
      await sleep(delay);
    }
  }
}
