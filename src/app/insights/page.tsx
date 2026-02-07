import { getLatestInsight } from "@/lib/db-queries";
import { InsightDisplay } from "@/components/insights/InsightDisplay";
import { StatsDashboard } from "@/components/stats/StatsDashboard";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const latest = await getLatestInsight();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 animate-fade-in">
        <hr className="section-rule mb-4 w-16" />
        <h1 className="font-display text-3xl font-bold">Community Voice</h1>
        <p className="mt-2 text-muted">
          AI-generated insights from what our community is telling us.
        </p>
      </div>

      <section className="mb-12">
        <InsightDisplay cachedInsight={latest?.insightText ?? null} />
        {latest && (
          <p className="mt-3 text-xs text-muted">
            Last generated from {latest.submissionCount} responses
            {latest.generationTimeMs
              ? ` in ${(latest.generationTimeMs / 1000).toFixed(1)}s`
              : ""}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Statistics</h2>
        <StatsDashboard />
      </section>
    </main>
  );
}
