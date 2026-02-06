import { NextResponse } from "next/server";
import {
  getSubmissionCount,
  getPressureCounts,
  getAverageChangeDirection,
  getDatasetSummary,
} from "@/lib/db-queries";
import { PRESSURE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
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

  return NextResponse.json({
    total,
    avgChange,
    pressures,
    summary,
  });
}
