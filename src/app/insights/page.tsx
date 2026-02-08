import { config } from "@/config";
import { getLatestInsight } from "@/lib/db-queries";
import { InsightSection } from "@/components/insights/InsightSection";
import { StatsDashboard } from "@/components/stats/StatsDashboard";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const latest = await getLatestInsight();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 animate-fade-in">
        <hr className="section-rule mb-4 w-16" />
        <h1 className="font-display text-3xl font-bold">{config.pages.insights.heading}</h1>
        <p className="mt-2 text-muted">
          {config.pages.insights.subtext}
        </p>
      </div>

      <section className="mb-12">
        <InsightSection
          cachedInsight={latest?.insightText ?? null}
          submissionCount={latest?.submissionCount}
          generationTimeMs={latest?.generationTimeMs}
        />
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Statistics</h2>
        <StatsDashboard />
      </section>
    </main>
  );
}
