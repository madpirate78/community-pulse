import type { Metadata } from "next";
import { config } from "@/config";
import { getLatestInsight } from "@/lib/db-queries";

export const metadata: Metadata = { title: "Insights" };
import { InsightDisplay } from "@/components/insights/InsightDisplay";

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
    </main>
  );
}
