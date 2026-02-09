import { db } from "@/db";
import { submissions, insightSnapshots, extractedThemes } from "@/db/schema";
import { count, desc, sql, eq, and } from "drizzle-orm";
import { config } from "@/config";
import type { DatasetSummary, ExtractedTheme, PressureOption } from "./types";
import { PRESSURE_OPTIONS } from "./types";

// Derive field names from config questions
const choiceField = config.questions.fixed.find((q) => q.type === "choice")?.fieldName ?? "biggest_pressure";
const scaleField = config.questions.fixed.find((q) => q.type === "scale")?.fieldName ?? "change_direction";
const textField = config.questions.fixed.find((q) => q.type === "text")?.fieldName ?? "sacrifice";

export async function getSubmissionCount(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(submissions)
    .where(eq(submissions.consentGiven, true));
  return row?.total ?? 0;
}

export async function getAllSubmissions(limit = 100, offset = 0) {
  return db
    .select()
    .from(submissions)
    .where(eq(submissions.consentGiven, true))
    .orderBy(desc(submissions.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPressureCounts(): Promise<
  Record<PressureOption, number>
> {
  const rows = await db
    .select({
      pressure: sql<string>`json_extract(${submissions.responses}, '$.' || ${choiceField})`,
      total: count(),
    })
    .from(submissions)
    .where(eq(submissions.consentGiven, true))
    .groupBy(sql`json_extract(${submissions.responses}, '$.' || ${choiceField})`);

  const counts = Object.fromEntries(
    PRESSURE_OPTIONS.map((p) => [p, 0])
  ) as Record<PressureOption, number>;

  for (const row of rows) {
    if (row.pressure && row.pressure in counts) {
      counts[row.pressure as PressureOption] = row.total;
    }
  }

  return counts;
}

export async function getAverageChangeDirection(): Promise<number> {
  const [row] = await db
    .select({
      avg: sql<number>`ROUND(AVG(json_extract(${submissions.responses}, '$.' || ${scaleField})), 1)`,
    })
    .from(submissions)
    .where(eq(submissions.consentGiven, true));

  return row?.avg ?? 0;
}

export async function getAllSacrifices(): Promise<string[]> {
  const allSubs = await db
    .select({ responses: submissions.responses })
    .from(submissions)
    .where(
      and(
        eq(submissions.consentGiven, true),
        eq(submissions.contentSafe, true)
      )
    );

  return allSubs
    .map((s) => (s.responses as Record<string, unknown>)?.[textField])
    .filter((s): s is string => typeof s === "string" && Boolean(s));
}

export async function getAllAdaptiveData(): Promise<Record<string, unknown>[]> {
  const allSubs = await db
    .select({ adaptiveData: submissions.adaptiveData })
    .from(submissions)
    .where(
      and(
        eq(submissions.consentGiven, true),
        eq(submissions.contentSafe, true),
        sql`${submissions.adaptiveData} IS NOT NULL`
      )
    );

  return allSubs
    .map((s) => s.adaptiveData)
    .filter((d): d is Record<string, unknown>[] => d != null)
    .flat();
}

export async function getLatestThemeExtraction() {
  const [latest] = await db
    .select()
    .from(extractedThemes)
    .orderBy(desc(extractedThemes.createdAt))
    .limit(1);
  return latest ?? null;
}

export async function getLatestThemes(): Promise<ExtractedTheme[] | null> {
  const latest = await getLatestThemeExtraction();
  return latest?.themes ?? null;
}

export async function getDatasetSummary(): Promise<DatasetSummary> {
  const [totalCount, pressureCounts, avgChange, sacrifices, aiThemes] = await Promise.all(
    [getSubmissionCount(), getPressureCounts(), getAverageChangeDirection(), getAllSacrifices(), getLatestThemes()]
  );

  // Find top pressure
  const sorted = Object.entries(pressureCounts).sort(([, a], [, b]) => b - a);
  const topPressure = sorted[0]?.[0] ?? "unknown";
  const topPressurePct =
    totalCount > 0
      ? Math.round(((sorted[0]?.[1] ?? 0) / totalCount) * 100)
      : 0;

  // Find emerging gap (category with fewest responses, excluding "other")
  const nonOther = sorted.filter(([key]) => key !== "other");
  const emergingGap =
    nonOther.length > 0 && nonOther[nonOther.length - 1][1] === 0
      ? nonOther[nonOther.length - 1][0]
      : nonOther.length > 0 && totalCount >= 10
        ? nonOther[nonOther.length - 1][0]
        : null;

  // Extract simple sacrifice themes from the texts
  const themes = extractSimpleThemes(sacrifices);

  return {
    total_responses: totalCount,
    pressure_counts: pressureCounts,
    top_pressure: topPressure,
    top_pressure_pct: topPressurePct,
    avg_change: avgChange,
    sacrifice_themes: themes,
    emerging_gap: emergingGap,
    ai_themes: aiThemes,
  };
}

function extractSimpleThemes(sacrifices: string[]): string[] {
  if (sacrifices.length === 0) return [];

  const themeKeywords = config.fallbackThemeKeywords;

  const counts: Record<string, number> = {};
  const lowerSacrifices = sacrifices.map((s) => s.toLowerCase());

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    counts[theme] = lowerSacrifices.filter((s) =>
      keywords.some((k) => s.includes(k))
    ).length;
  }

  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme);
}

export async function getLatestInsight() {
  const [latest] = await db
    .select()
    .from(insightSnapshots)
    .orderBy(desc(insightSnapshots.createdAt))
    .limit(1);
  return latest ?? null;
}

export async function getRecentSubmissionCounts() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  const [weekResult] = await db
    .select({ total: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.consentGiven, true),
        sql`${submissions.createdAt} >= ${weekAgo}`
      )
    );

  const [monthResult] = await db
    .select({ total: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.consentGiven, true),
        sql`${submissions.createdAt} >= ${monthAgo}`
      )
    );

  return {
    thisWeek: weekResult?.total ?? 0,
    thisMonth: monthResult?.total ?? 0,
  };
}
