import { extractThemes } from "@/lib/theme-extraction";
import { aiLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";
import { MAX_RETRIES, RETRY_DELAYS, sleep, isRetryableStatus } from "@/lib/retry";
import { log } from "@/lib/logger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = applyRateLimit(req, aiLimiter);
  if (blocked) return blocked;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const themes = await extractThemes();

      if (!themes) {
        return NextResponse.json(
          { message: "Not enough submissions for theme extraction (minimum 5)." },
          { status: 200 }
        );
      }

      return NextResponse.json({ themes });
    } catch (error: unknown) {
      lastError = error;
      const status = (error as { status?: number }).status;
      if (isRetryableStatus(status) && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt];
        log.info(
          `Theme extraction model busy (${status}), retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await sleep(delay);
        continue;
      }
      break;
    }
  }

  log.error("Theme extraction error:", lastError);
  const status = (lastError as { status?: number }).status;
  if (isRetryableStatus(status)) {
    return NextResponse.json(
      { error: "Model is busy — please try again in a minute." },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { error: "Failed to extract themes" },
    { status: 500 }
  );
}
