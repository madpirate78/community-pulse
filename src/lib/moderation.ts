import { ThinkingLevel } from "@google/genai";
import { eq } from "drizzle-orm";
import { getAI, MODELS } from "@/lib/gemini";
import { renderPrompt } from "@/lib/prompt-renderer";
import { config } from "@/config";
import { db } from "@/db";
import { submissions } from "@/db/schema";

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Extract free-text strings from fixed answers and adaptive data.
 * Reads text field names from config so new text questions are
 * automatically covered without code changes.
 */
export function collectFreeText(
  fixedAnswers: Record<string, unknown>,
  adaptiveData: Record<string, unknown>[] | null
): string[] {
  const texts: string[] = [];

  const textFieldNames = config.questions.fixed
    .filter((q) => q.type === "text")
    .map((q) => q.fieldName);

  for (const field of textFieldNames) {
    const val = fixedAnswers[field];
    if (typeof val === "string" && val.trim().length > 0) {
      texts.push(val.trim());
    }
  }

  if (adaptiveData) {
    for (const entry of adaptiveData) {
      if (
        entry.input_type === "short_text" &&
        typeof entry.answer === "string" &&
        entry.answer.trim().length > 0
      ) {
        texts.push(entry.answer.trim());
      }
    }
  }

  return texts;
}

/**
 * Run content moderation on free-text submissions via Gemini Flash.
 * Throws on API/network errors — caller decides how to handle.
 */
export async function moderateContent(
  texts: string[]
): Promise<ModerationResult> {
  if (texts.length === 0) return { safe: true };

  const prompt = renderPrompt(config.prompts.moderation, {
    count: texts.length,
    texts: texts.map((t, i) => `${i + 1}. "${t}"`).join("\n"),
  });

  const response = await getAI().models.generateContent({
    model: MODELS.flash,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object" as const,
        properties: {
          safe: { type: "boolean" as const },
          reason: { type: "string" as const },
        },
        required: ["safe"],
      },
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    },
  });

  let result: ModerationResult;
  try {
    result = JSON.parse(response.text ?? "{}");
  } catch {
    console.error("Failed to parse moderation response:", response.text);
    throw new Error("Moderation returned invalid JSON");
  }
  return { safe: result.safe !== false, reason: result.reason };
}

const RETRY_DELAYS = [5_000, 15_000, 30_000];

/**
 * Background retry for moderation after an API error.
 * Attempts up to 3 times with backoff (5s, 15s, 30s).
 * On success: updates the row to contentSafe = true.
 * On moderation failure (unsafe): updates to contentSafe = false.
 * On exhausted retries: row stays contentSafe = null permanently.
 */
export async function retryModeration(
  submissionId: string,
  texts: string[]
): Promise<void> {
  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));

    try {
      const result = await moderateContent(texts);

      await db
        .update(submissions)
        .set({ contentSafe: result.safe })
        .where(eq(submissions.id, submissionId));

      console.log(
        `Retry moderation ${result.safe ? "passed" : "failed"} for ${submissionId} (attempt ${attempt + 1})`
      );
      return;
    } catch (error) {
      console.warn(
        `Retry moderation attempt ${attempt + 1}/${RETRY_DELAYS.length} failed for ${submissionId}:`,
        error
      );
    }
  }

  console.error(
    `Retry moderation exhausted for ${submissionId} — row stays unmoderated`
  );
}
