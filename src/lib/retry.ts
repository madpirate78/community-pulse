/** Shared retry infrastructure for AI API calls. */

export const MAX_RETRIES = 3;
export const RETRY_DELAYS = [5_000, 15_000, 30_000];

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Status codes that indicate a transient overload — safe to retry. */
export function isRetryableStatus(status: unknown): boolean {
  return status === 503 || status === 429;
}
