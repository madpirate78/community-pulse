import { getLatestInsight } from "@/lib/db-queries";
import { StreamingInsight } from "@/components/insights/StreamingInsight";
import { StatsDashboard } from "@/components/stats/StatsDashboard";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const latest = await getLatestInsight();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Community Voice</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          AI-generated insights from what our community is telling us.
        </p>
      </div>

      <section className="mb-12">
        <StreamingInsight cachedInsight={latest?.insightText ?? null} />
        {latest && (
          <p className="mt-3 text-xs text-gray-400">
            Last generated from {latest.submissionCount} responses
            {latest.generationTimeMs
              ? ` in ${(latest.generationTimeMs / 1000).toFixed(1)}s`
              : ""}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Statistics</h2>
        <StatsDashboard />
      </section>
    </main>
  );
}
