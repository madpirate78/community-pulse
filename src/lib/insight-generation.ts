import { getAI, MODELS } from "@/lib/gemini";
import { buildInsightSystemPrompt, buildInsightUserPrompt } from "@/lib/prompts";
import {
  getDatasetSummary,
  getAllSacrifices,
  getAllAdaptiveData,
  getPressureCounts,
  getRecentSubmissionCounts,
  getSubmissionCount,
  getLatestInsight,
} from "@/lib/db-queries";
import { PRESSURE_LABELS } from "@/lib/types";
import { db } from "@/db";
import { insightSnapshots } from "@/db/schema";

const INSIGHT_INTERVAL = 5;
const INSIGHT_COOLDOWN_MS = 60 * 60 * 1000;

let insightInProgress = false;

export async function shouldGenerateInsight(): Promise<boolean> {
  const [currentCount, latest] = await Promise.all([
    getSubmissionCount(),
    getLatestInsight(),
  ]);

  if (currentCount < 5) return false;
  if (!latest) return true;

  const sinceLastInsight = currentCount - latest.submissionCount;
  const elapsed = Date.now() - new Date(latest.createdAt).getTime();

  return sinceLastInsight >= INSIGHT_INTERVAL && elapsed >= INSIGHT_COOLDOWN_MS;
}

export async function generateInsight(): Promise<string | null> {
  const start = Date.now();

  const [summary, sacrifices, adaptiveData, pressureCounts, recent] =
    await Promise.all([
      getDatasetSummary(),
      getAllSacrifices(),
      getAllAdaptiveData(),
      getPressureCounts(),
      getRecentSubmissionCounts(),
    ]);

  if (summary.total_responses === 0) return null;

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

  const response = await getAI().models.generateContent({
    model: MODELS.thinking,
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from insight generation model");
  }

  await db.insert(insightSnapshots).values({
    insightText: text,
    dataSummary: summary as unknown as Record<string, unknown>,
    submissionCount: summary.total_responses,
    modelUsed: MODELS.thinking,
    generationTimeMs: Date.now() - start,
  });

  return text;
}

export async function maybeGenerateInsight(): Promise<string | null> {
  if (insightInProgress) return null;

  const needed = await shouldGenerateInsight();
  if (!needed) return null;

  insightInProgress = true;
  try {
    return await generateInsight();
  } finally {
    insightInProgress = false;
  }
}
