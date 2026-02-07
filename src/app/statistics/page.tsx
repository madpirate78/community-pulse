import { config } from "@/config";
import { StatsDashboard } from "@/components/stats/StatsDashboard";

export default function StatisticsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold">{config.pages.statistics.heading}</h1>
        <p className="mt-2 text-muted">
          {config.pages.statistics.subtext}
        </p>
      </div>
      <StatsDashboard />
    </main>
  );
}
