import { ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";
import { getAI, MODELS } from "@/lib/gemini";
import { buildInsightContext, saveInsightSnapshot } from "@/lib/insight-generation";
import { aiLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";
import { withRetry, isRetryableStatus } from "@/lib/retry";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = applyRateLimit(req, aiLimiter);
  if (blocked) return blocked;
  const start = Date.now();
  try {
    const context = await buildInsightContext();
    if (!context) {
      return NextResponse.json({ message: "No submissions yet." });
    }

    const response = await withRetry(
      () =>
        getAI().models.generateContentStream({
          model: MODELS.thinking,
          contents: context.userPrompt,
          config: {
            systemInstruction: context.systemPrompt,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        }),
      "Insight generation"
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";
        try {
          for await (const chunk of response) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          // Don't persist a partial narrative — it would surface as the
          // cached Community Voice.
          log.error("Insight stream failed mid-generation:", err);
          controller.error(err);
          return;
        }
        if (fullText) {
          try {
            await saveInsightSnapshot(fullText, context.summary, start);
          } catch (err) {
            log.error("Failed to persist insight snapshot:", err);
          }
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    log.error("Insight generation error:", error);
    const status = (error as { status?: number }).status;
    if (isRetryableStatus(status)) {
      return NextResponse.json(
        { error: "Model is busy — please try again in a minute." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}
