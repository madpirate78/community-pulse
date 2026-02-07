import { config } from "@/config";
import { renderPrompt } from "./prompt-renderer";
import type { FixedAnswers, DatasetSummary } from "./types";

export function buildAdaptiveQuestionPrompt(
  userAnswers: FixedAnswers,
  datasetSummary: DatasetSummary
): string {
  const sacrificeThemes = datasetSummary.ai_themes
    ? datasetSummary.ai_themes
        .map((t) => `"${t.name}" (~${t.frequency} mentions): ${t.description}`)
        .join("; ")
    : datasetSummary.sacrifice_themes.join(", ");

  const emergingGapLine = datasetSummary.emerging_gap
    ? `- DATA GAP: We have very few responses about ${datasetSummary.emerging_gap}`
    : "";

  let volumeGuidance: string;
  if (datasetSummary.total_responses < 10) {
    volumeGuidance =
      "We have very few responses. Ask broader questions to establish baseline understanding.";
  } else if (datasetSummary.total_responses < 50) {
    volumeGuidance =
      "We're building a picture. Start probing for nuance within the dominant themes.";
  } else {
    volumeGuidance =
      "We have substantial data. Ask targeted questions to uncover the most surprising or underreported patterns.";
  }

  return renderPrompt(config.prompts.adaptiveQuestions, {
    biggest_pressure: String((userAnswers as Record<string, unknown>).biggest_pressure ?? ""),
    change_direction: String((userAnswers as Record<string, unknown>).change_direction ?? ""),
    sacrifice: String((userAnswers as Record<string, unknown>).sacrifice ?? ""),
    total_responses: datasetSummary.total_responses,
    top_pressure: datasetSummary.top_pressure,
    top_pressure_pct: datasetSummary.top_pressure_pct,
    avg_change: datasetSummary.avg_change,
    sacrifice_themes: sacrificeThemes,
    emerging_gap_line: emergingGapLine,
    volume_guidance: volumeGuidance,
  });
}

export function buildInsightSystemPrompt(): string {
  return config.prompts.insightSystem;
}

export function buildInsightUserPrompt(
  stats: DatasetSummary,
  pressuresRanked: string,
  allSacrifices: string[],
  allAdaptiveAnswers: object[],
  newThisWeek?: number,
  newThisMonth?: number
): string {
  const recencyParts: string[] = [];
  if (newThisWeek != null) recencyParts.push(`New this week: ${newThisWeek} responses.`);
  if (newThisMonth != null) recencyParts.push(`New this month: ${newThisMonth} responses.`);
  const recencyLine = recencyParts.join("\n");

  let aiThemesBlock = "";
  if (stats.ai_themes) {
    aiThemesBlock = `
COMMUNITY THEMES (AI-discovered patterns across all sacrifice responses):
${stats.ai_themes
  .map(
    (t) =>
      `- ${t.name} (~${t.frequency} mentions): ${t.description}\n  Quotes: ${t.representative_quotes.map((q) => `"${q}"`).join(", ")}`
  )
  .join("\n")}

Use the COMMUNITY THEMES section to structure your narrative around the dominant patterns, but let the individual quotes bring them to life.
`;
  }

  return renderPrompt(config.prompts.insightUser, {
    total_responses: stats.total_responses,
    recency_line: recencyLine,
    pressures_ranked: pressuresRanked,
    avg_change: stats.avg_change,
    ai_themes_block: aiThemesBlock,
    all_sacrifices: allSacrifices.map((s) => `- "${s}"`).join("\n"),
    adaptive_answers: JSON.stringify(allAdaptiveAnswers, null, 2),
  });
}
