import type { FixedAnswers, DatasetSummary } from "./types";

export function buildAdaptiveQuestionPrompt(
  userAnswers: FixedAnswers,
  datasetSummary: DatasetSummary
): string {
  return `You are designing follow-up questions for an anonymous cost-of-living survey.

This person just answered:
- Biggest financial pressure: ${userAnswers.biggest_pressure}
- How things have changed (1=much better, 5=much worse): ${userAnswers.change_direction}
- What they've sacrificed: "${userAnswers.sacrifice}"

Current dataset overview (${datasetSummary.total_responses} responses so far):
- Top pressure: ${datasetSummary.top_pressure} (${datasetSummary.top_pressure_pct}%)
- Average change score: ${datasetSummary.avg_change}/5
- Most common sacrifice themes: ${
    datasetSummary.ai_themes
      ? datasetSummary.ai_themes
          .map((t) => `"${t.name}" (~${t.frequency} mentions): ${t.description}`)
          .join("; ")
      : datasetSummary.sacrifice_themes.join(", ")
  }
${datasetSummary.emerging_gap ? `- DATA GAP: We have very few responses about ${datasetSummary.emerging_gap}` : ""}

Generate 1-2 follow-up questions that:
1. DIG DEEPER into this person's specific situation (based on their pressure + sacrifice)
2. FILL GAPS in the dataset — ask about something the community hasn't told us much about yet
3. Are QUICK to answer (single choice with 3-5 options, a 1-5 scale, or a short text under 100 chars)
4. Feel CONVERSATIONAL and empathetic, not clinical
5. NEVER ask for identifying information (no name, postcode, employer, income figures)

${
  datasetSummary.total_responses < 10
    ? "We have very few responses. Ask broader questions to establish baseline understanding."
    : datasetSummary.total_responses < 50
      ? "We're building a picture. Start probing for nuance within the dominant themes."
      : "We have substantial data. Ask targeted questions to uncover the most surprising or underreported patterns."
}

Return exactly 1-2 questions as structured JSON.`;
}

export function buildInsightSystemPrompt(): string {
  return `You are a community research analyst synthesising anonymous feedback data
into a narrative insight report. You write as the voice of the community —
using "we" and "our" language.

Your role is to:
- Identify dominant themes and their relative weight
- Note emerging concerns or shifts in the data
- Maintain a constructive, forward-looking tone
- Ground every claim in the actual numbers provided
- NEVER invent specific stories, quotes, or individual experiences
- NEVER speculate beyond what the data supports

Style: Clear, accessible prose. No jargon. Write for a community notice board,
not an academic paper. Use short paragraphs. Be warm but honest.

Format your response as:
1. Opening statement (1 sentence capturing the overall picture)
2. Key themes (2-3 short paragraphs on dominant concerns)
3. Community aspirations (what improvements people want)
4. Closing observation (1 sentence, forward-looking)`;
}

export function buildInsightUserPrompt(
  stats: DatasetSummary,
  pressuresRanked: string,
  allSacrifices: string[],
  allAdaptiveAnswers: object[],
  newThisWeek?: number,
  newThisMonth?: number
): string {
  return `Analyse this community feedback data and generate a Community Voice insight.

DATASET: ${stats.total_responses} anonymous responses collected.
${newThisWeek != null ? `New this week: ${newThisWeek} responses.\n` : ""}${newThisMonth != null ? `New this month: ${newThisMonth} responses.\n` : ""}
BIGGEST PRESSURES (ranked):
${pressuresRanked}

DIRECTION OF CHANGE: Average score ${stats.avg_change}/5
(1=much better, 5=much worse)
${
  stats.ai_themes
    ? `
COMMUNITY THEMES (AI-discovered patterns across all sacrifice responses):
${stats.ai_themes
  .map(
    (t) =>
      `- ${t.name} (~${t.frequency} mentions): ${t.description}\n  Quotes: ${t.representative_quotes.map((q) => `"${q}"`).join(", ")}`
  )
  .join("\n")}

Use the COMMUNITY THEMES section to structure your narrative around the dominant patterns, but let the individual quotes bring them to life.
`
    : ""
}
WHAT PEOPLE HAVE SACRIFICED (their own words):
${allSacrifices.map((s) => `- "${s}"`).join("\n")}

DEEPER INSIGHTS (from adaptive follow-up questions):
${JSON.stringify(allAdaptiveAnswers, null, 2)}

Generate a 250-350 word Community Voice narrative.

IMPORTANT: The "sacrifice" answers are the emotional core. A list
showing "heating", "seeing friends", "fresh fruit", "my career"
tells a more powerful story than any percentage. Use them.

Do NOT invent stories. Do NOT add data you weren't given.
Write like a community leader addressing a council meeting —
warm, direct, evidence-based.`;
}
