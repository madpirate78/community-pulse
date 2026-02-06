import { NextResponse } from "next/server";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ThinkingLevel } from "@google/genai";
import { getAI, MODELS } from "@/lib/gemini";
import { fixedQuestionsSchema, adaptiveQuestionSchema } from "@/lib/types";
import { buildAdaptiveQuestionPrompt } from "@/lib/prompts";
import { getDatasetSummary } from "@/lib/db-queries";
import type { AdaptiveQuestions } from "@/lib/types";
import { aiLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";

export async function POST(req: Request) {
  const blocked = applyRateLimit(req, aiLimiter);
  if (blocked) return blocked;
  try {
    const body = await req.json();
    const parsed = fixedQuestionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid answers", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const summary = await getDatasetSummary();
    const prompt = buildAdaptiveQuestionPrompt(parsed.data, summary);

    const response = await getAI().models.generateContent({
      model: MODELS.flash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(
          adaptiveQuestionSchema
        ) as Record<string, unknown>,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const questions: AdaptiveQuestions = JSON.parse(response.text ?? "{}");
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Adaptive questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
