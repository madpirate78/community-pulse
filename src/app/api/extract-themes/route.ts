import { extractThemes } from "@/lib/theme-extraction";
import { aiLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [5_000, 15_000, 30_000];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      if ((status === 503 || status === 429) && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt];
        console.log(
          `Theme extraction model busy (${status}), retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await sleep(delay);
        continue;
      }
      break;
    }
  }

  console.error("Theme extraction error:", lastError);
  const status = (lastError as { status?: number }).status;
  if (status === 503 || status === 429) {
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
