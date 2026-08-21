import { NextResponse } from "next/server";
import { extractThemes } from "@/lib/theme-extraction";
import { config } from "@/config";
import { aiLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";
import { withRetry, isRetryableStatus } from "@/lib/retry";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = applyRateLimit(req, aiLimiter);
  if (blocked) return blocked;

  try {
    const themes = await withRetry(() => extractThemes(), "Theme extraction");

    if (!themes) {
      return NextResponse.json({
        message: `Not enough submissions for theme extraction (minimum ${config.operational.minSubmissionsForAI}).`,
      });
    }

    return NextResponse.json({ themes });
  } catch (error) {
    log.error("Theme extraction error:", error);
    const status = (error as { status?: number }).status;
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
}
