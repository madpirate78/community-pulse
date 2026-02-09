import { ThinkingLevel } from "@google/genai";
import { getAI, MODELS } from "@/lib/gemini";
import { buildInsightSystemPrompt, buildInsightUserPrompt } from "@/lib/prompts";
import {
  getDatasetSummary,
  getAllSacrifices,
  getAllAdaptiveData,
  getPressureCounts,
  getRecentSubmissionCounts,
} from "@/lib/db-queries";
import { PRESSURE_LABELS } from "@/lib/types";
import { aiLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";
import { db } from "@/db";
import { insightSnapshots } from "@/db/schema";

export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [5_000, 15_000, 30_000];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  const blocked = applyRateLimit(req, aiLimiter);
  if (blocked) return blocked;
  const start = Date.now();
  try {
    const [summary, sacrifices, adaptiveData, pressureCounts, recent] =
      await Promise.all([
        getDatasetSummary(),
        getAllSacrifices(),
        getAllAdaptiveData(),
        getPressureCounts(),
        getRecentSubmissionCounts(),
      ]);

    if (summary.total_responses === 0) {
      return new Response("No submissions yet.", { status: 200 });
    }

    const pressuresRanked = Object.entries(pressureCounts)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0)
      .map(
        ([key, count]) =>
          `${PRESSURE_LABELS[key] ?? key}: ${count} (${Math.round((count / summary.total_responses) * 100)}%)`
      )
      .join("\n");

    const systemPrompt = buildInsightSystemPrompt();
    const userPrompt = buildInsightUserPrompt(
      summary,
      pressuresRanked,
      sacrifices,
      adaptiveData,
      recent.thisWeek,
      recent.thisMonth
    );

    // Retry with backoff for overloaded model (503) and rate limits (429)
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await getAI().models.generateContentStream({
          model: MODELS.thinking,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        const encoder = new TextEncoder();
        let fullText = "";
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of response) {
                const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  fullText += text;
                  controller.enqueue(encoder.encode(text));
                }
              }
            } finally {
              controller.close();
              if (fullText) {
                try {
                  await db.insert(insightSnapshots).values({
                    insightText: fullText,
                    dataSummary: summary as unknown as Record<string, unknown>,
                    submissionCount: summary.total_responses,
                    modelUsed: MODELS.thinking,
                    generationTimeMs: Date.now() - start,
                  });
                } catch (err) {
                  console.error("Failed to persist insight snapshot:", err);
                }
              }
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      } catch (error: unknown) {
        lastError = error;
        const status = (error as { status?: number }).status;
        if ((status === 503 || status === 429) && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS[attempt];
          console.log(`Model busy (${status}), retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Insight generation error:", error);
    const status = (error as { status?: number }).status;
    if (status === 503 || status === 429) {
      return new Response("Model is busy — please try again in a minute.", {
        status: 503,
      });
    }
    return new Response("Failed to generate insight", { status: 500 });
  }
}
