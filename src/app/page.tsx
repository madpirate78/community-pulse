import { getDatasetSummary, getLatestInsight } from "@/lib/db-queries";
import { HeroSection } from "@/components/landing/HeroSection";
import { InsightPreview } from "@/components/landing/InsightPreview";
import { StatsBar } from "@/components/stats/StatsBar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [summary, latestInsight] = await Promise.all([
    getDatasetSummary(),
    getLatestInsight(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4">
      <HeroSection />

      {summary.total_responses > 0 && (
        <div className="mx-auto mb-12 max-w-2xl">
          <StatsBar
            total={summary.total_responses}
            topPressure={summary.top_pressure}
            topPressurePct={summary.top_pressure_pct}
            avgChange={summary.avg_change}
          />
        </div>
      )}

      <InsightPreview insightText={latestInsight?.insightText ?? null} />
    </main>
  );
}
