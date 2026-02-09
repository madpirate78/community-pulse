import { ThinkingLevel } from "@google/genai";
import { getAI, MODELS } from "@/lib/gemini";
import { getAllSacrifices, getSubmissionCount, getLatestThemeExtraction } from "@/lib/db-queries";
import { extractedThemesResponseSchema } from "@/lib/types";
import type { ExtractedTheme } from "@/lib/types";
import { config } from "@/config";
import { renderPrompt } from "@/lib/prompt-renderer";
import { log } from "@/lib/logger";
import { db } from "@/db";
import { extractedThemes } from "@/db/schema";

let inflight: Promise<ExtractedTheme[] | null> | null = null;

function buildThemeExtractionPrompt(sacrifices: string[]): string {
  return renderPrompt(config.prompts.themeExtraction, {
    count: sacrifices.length,
    responses: sacrifices.map((s, i) => `${i + 1}. "${s}"`).join("\n"),
  });
}

export async function extractThemes(): Promise<ExtractedTheme[] | null> {
  const [sacrifices, totalCount] = await Promise.all([
    getAllSacrifices(),
    getSubmissionCount(),
  ]);

  if (sacrifices.length < config.operational.minSubmissionsForAI) {
    return null;
  }

  const start = Date.now();
  const prompt = buildThemeExtractionPrompt(sacrifices);

  const response = await getAI().models.generateContent({
    model: MODELS.thinking,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: "object" as const,
        properties: {
          themes: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" as const },
                description: { type: "string" as const },
                frequency: { type: "number" as const },
                representative_quotes: {
                  type: "array" as const,
                  items: { type: "string" as const },
                },
              },
              required: ["name", "description", "frequency", "representative_quotes"],
            },
          },
        },
        required: ["themes"],
      },
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from theme extraction model");
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(text);
  } catch {
    log.error("Failed to parse theme extraction response:", text);
    throw new Error("Theme extraction returned invalid JSON");
  }
  const parsed = extractedThemesResponseSchema.parse(rawJson);

  await db.insert(extractedThemes).values({
    themes: parsed.themes,
    submissionCount: totalCount,
    modelUsed: MODELS.thinking,
    generationTimeMs: Date.now() - start,
  });

  return parsed.themes;
}

export async function shouldExtract(): Promise<boolean> {
  const [currentCount, latest] = await Promise.all([
    getSubmissionCount(),
    getLatestThemeExtraction(),
  ]);

  if (currentCount < config.operational.minSubmissionsForAI) return false;
  if (!latest) return true;
  return currentCount - latest.submissionCount >= config.operational.themeExtractionInterval;
}

export function maybeExtractThemes(): Promise<ExtractedTheme[] | null> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const needed = await shouldExtract();
      if (!needed) return null;
      return await extractThemes();
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
