import { ThinkingLevel } from "@google/genai";
import { getAI, MODELS } from "@/lib/gemini";
import { renderPrompt } from "@/lib/prompt-renderer";
import { config } from "@/config";

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
 * Fails open — any API/network error returns { safe: true }.
 */
export async function moderateContent(
  texts: string[]
): Promise<ModerationResult> {
  if (texts.length === 0) return { safe: true };

  try {
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

    const result: ModerationResult = JSON.parse(response.text ?? "{}");
    return { safe: result.safe !== false, reason: result.reason };
  } catch (error) {
    console.error("Moderation check failed (fail-open):", error);
    return { safe: true };
  }
}
