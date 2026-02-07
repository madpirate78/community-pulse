import { NextResponse } from "next/server";
import {
  getSubmissionCount,
  getPressureCounts,
  getAverageChangeDirection,
  getDatasetSummary,
} from "@/lib/db-queries";
import { PRESSURE_LABELS } from "@/lib/types";
import { config } from "@/config";
import { readLimiter } from "@/lib/rate-limit";
import { applyRateLimit } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

let cachedResponse: { data: unknown; expiresAt: number } | null = null;

export async function GET(req: Request) {
  const blocked = applyRateLimit(req, readLimiter);
  if (blocked) return blocked;

  if (cachedResponse && Date.now() < cachedResponse.expiresAt) {
    return NextResponse.json(cachedResponse.data);
  }

  const [total, pressureCounts, avgChange, summary] = await Promise.all([
    getSubmissionCount(),
    getPressureCounts(),
    getAverageChangeDirection(),
    getDatasetSummary(),
  ]);

  const pressures = Object.entries(pressureCounts)
    .map(([key, count]) => ({
      key,
      label: PRESSURE_LABELS[key] ?? key,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const data = { total, avgChange, pressures, summary };
  cachedResponse = { data, expiresAt: Date.now() + config.operational.statisticsCacheTtlMs };

  return NextResponse.json(data);
}
