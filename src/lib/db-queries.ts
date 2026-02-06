import { db } from "@/db";
import { submissions, insightSnapshots } from "@/db/schema";
import { count, desc, sql, eq, and } from "drizzle-orm";
import type { DatasetSummary, PressureOption } from "./types";
import { PRESSURE_OPTIONS } from "./types";

export async function getSubmissionCount(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(submissions)
    .where(eq(submissions.consentGiven, true));
  return row?.total ?? 0;
}

export async function getAllSubmissions() {
  return db
    .select()
    .from(submissions)
    .where(eq(submissions.consentGiven, true))
    .orderBy(desc(submissions.createdAt));
}

export async function getPressureCounts(): Promise<
  Record<PressureOption, number>
> {
  const allSubs = await db
    .select({ responses: submissions.responses })
    .from(submissions)
    .where(eq(submissions.consentGiven, true));

  const counts = Object.fromEntries(
    PRESSURE_OPTIONS.map((p) => [p, 0])
  ) as Record<PressureOption, number>;

  for (const sub of allSubs) {
    const pressure = (sub.responses as { biggest_pressure?: string })
      ?.biggest_pressure;
    if (pressure && pressure in counts) {
      counts[pressure as PressureOption]++;
    }
  }

  return counts;
}

export async function getAverageChangeDirection(): Promise<number> {
  const allSubs = await db
    .select({ responses: submissions.responses })
    .from(submissions)
    .where(eq(submissions.consentGiven, true));

  if (allSubs.length === 0) return 0;

  const sum = allSubs.reduce((acc, sub) => {
    const change = (sub.responses as { change_direction?: number })
      ?.change_direction;
    return acc + (change ?? 0);
  }, 0);

  return Math.round((sum / allSubs.length) * 10) / 10;
}

export async function getAllSacrifices(): Promise<string[]> {
  const allSubs = await db
    .select({ responses: submissions.responses })
    .from(submissions)
    .where(eq(submissions.consentGiven, true));

  return allSubs
    .map((s) => (s.responses as { sacrifice?: string })?.sacrifice)
    .filter((s): s is string => Boolean(s));
}

export async function getAllAdaptiveData(): Promise<Record<string, unknown>[]> {
  const allSubs = await db
    .select({ adaptiveData: submissions.adaptiveData })
    .from(submissions)
    .where(
      and(
        eq(submissions.consentGiven, true),
        sql`${submissions.adaptiveData} IS NOT NULL`
      )
    );

  return allSubs
    .map((s) => s.adaptiveData)
    .filter((d): d is Record<string, unknown>[] => d != null)
    .flat();
}

export async function getDatasetSummary(): Promise<DatasetSummary> {
  const [totalCount, pressureCounts, avgChange, sacrifices] = await Promise.all(
    [getSubmissionCount(), getPressureCounts(), getAverageChangeDirection(), getAllSacrifices()]
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
    top_pressure: topPressure,
    top_pressure_pct: topPressurePct,
    avg_change: avgChange,
    sacrifice_themes: themes,
    emerging_gap: emergingGap,
  };
}

function extractSimpleThemes(sacrifices: string[]): string[] {
  if (sacrifices.length === 0) return [];

  const themeKeywords: Record<string, string[]> = {
    socialising: ["friends", "social", "going out", "pub", "restaurant"],
    heating: ["heating", "heat", "warm", "thermostat"],
    "food quality": ["fresh", "fruit", "organic", "meat", "quality"],
    hobbies: ["gym", "hobby", "sport", "club", "membership"],
    holidays: ["holiday", "travel", "vacation", "trip"],
    transport: ["car", "petrol", "bus", "train", "commute"],
    childcare: ["childcare", "nursery", "school"],
    entertainment: ["streaming", "netflix", "cinema", "entertainment"],
  };

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
