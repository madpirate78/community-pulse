import { StatsDashboard } from "@/components/stats/StatsDashboard";

export default function StatisticsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Community Statistics</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        An overview of what our community is experiencing.
      </p>
      <StatsDashboard />
    </main>
  );
}
