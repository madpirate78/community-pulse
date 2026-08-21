import { NextResponse } from "next/server";
import { getDatasetSummary } from "@/lib/db-queries";
import { PRESSURE_LABELS } from "@/lib/types";
import type { StatisticsResponse } from "@/lib/types";
import { config } from "@/config";
import { readLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

// TTL cache: new submissions may take up to statisticsCacheTtlMs to
// appear in the dashboard — a deliberate trade against DB load.
let cachedResponse: { data: StatisticsResponse; expiresAt: number } | null =
  null;

export async function GET(req: Request) {
  const blocked = applyRateLimit(req, readLimiter);
  if (blocked) return blocked;

  if (cachedResponse && Date.now() < cachedResponse.expiresAt) {
    return NextResponse.json(cachedResponse.data);
  }

  try {
    const summary = await getDatasetSummary();
    const total = summary.total_responses;

    const pressures = Object.entries(summary.pressure_counts)
      .map(([key, count]) => ({
        key,
        label: PRESSURE_LABELS[key] ?? key,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const data: StatisticsResponse = {
      total,
      avgChange: summary.avg_change,
      topPressure: summary.top_pressure,
      topPressurePct: summary.top_pressure_pct,
      pressures,
      sacrificeThemes: summary.sacrifice_themes,
    };
    cachedResponse = {
      data,
      expiresAt: Date.now() + config.operational.statisticsCacheTtlMs,
    };

    return NextResponse.json(data);
  } catch (error) {
    log.error("Statistics error:", error);
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
