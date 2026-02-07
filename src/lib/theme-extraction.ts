import { getAI, MODELS } from "@/lib/gemini";
import { getAllSacrifices, getSubmissionCount, getLatestThemeExtraction } from "@/lib/db-queries";
import { extractedThemesResponseSchema } from "@/lib/types";
import type { ExtractedTheme } from "@/lib/types";
import { db } from "@/db";
import { extractedThemes } from "@/db/schema";

const EXTRACTION_INTERVAL = 5;

let extractionInProgress = false;

function buildThemeExtractionPrompt(sacrifices: string[]): string {
  return `You are analysing anonymous free-text responses to the question:
"What have you had to cut back on or give up because of rising costs?"

Here are all ${sacrifices.length} responses:
${sacrifices.map((s, i) => `${i + 1}. "${s}"`).join("\n")}

Discover the dominant themes that emerge from these responses. Do NOT use predefined categories — let the patterns emerge from the actual language people use.

For each theme:
- Give it a short, plain-language name (2-4 words)
- Write a one-sentence description of what this theme captures
- Count how many responses relate to this theme (a response can belong to multiple themes)
- Include 1-3 verbatim quotes that best represent this theme

Rules:
- Return between 1 and 12 themes, ranked by frequency (most common first)
- Only create a theme if at least 2 responses relate to it
- Use the respondents' own language where possible
- Do not invent or embellish quotes — use exact text from the responses above

Return valid JSON matching the schema.`;
}

export async function extractThemes(): Promise<ExtractedTheme[] | null> {
  const [sacrifices, totalCount] = await Promise.all([
    getAllSacrifices(),
    getSubmissionCount(),
  ]);

  if (sacrifices.length < 5) {
    return null;
  }

  const start = Date.now();
  const prompt = buildThemeExtractionPrompt(sacrifices);

  const response = await getAI().models.generateContent({
    model: MODELS.thinking,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
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

  const parsed = extractedThemesResponseSchema.parse(JSON.parse(text));

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

  if (currentCount < 5) return false;
  if (!latest) return true;
  return currentCount - latest.submissionCount >= EXTRACTION_INTERVAL;
}

export async function maybeExtractThemes(): Promise<ExtractedTheme[] | null> {
  if (extractionInProgress) return null;

  const needed = await shouldExtract();
  if (!needed) return null;

  extractionInProgress = true;
  try {
    return await extractThemes();
  } finally {
    extractionInProgress = false;
  }
}
