import { NextResponse } from "next/server";
import type { RateLimiter } from "./rate-limit";

/**
 * Extract the client IP from request headers.
 * Checks x-forwarded-for (reverse proxy) then x-real-ip, falls back to
 * a constant so rate limiting still works in development.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}

/**
 * Apply a rate limiter to a request. Returns a 429 Response if blocked,
 * or null if the request is allowed.
 */
export function applyRateLimit(
  req: Request,
  limiter: RateLimiter
): NextResponse | null {
  const ip = getClientIp(req);
  const result = limiter.check(ip);

  if (!result.allowed) {
    const retryAfter = Math.ceil(result.retryAfterMs / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  return null;
}
