"use client";

import { useEffect, useState } from "react";
import { PressureChart } from "./PressureChart";
import { StatsBar } from "./StatsBar";

interface PressureData {
  key: string;
  label: string;
  count: number;
  pct: number;
}

interface StatsData {
  total: number;
  avgChange: number;
  pressures: PressureData[];
  summary: {
    top_pressure: string;
    top_pressure_pct: number;
    sacrifice_themes: string[];
  };
}

export function StatsDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statistics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-72 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
        <p className="text-lg font-medium">No submissions yet</p>
        <p className="mt-1 text-sm">
          Be the first to add your voice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsBar
        total={data.total}
        topPressure={data.summary.top_pressure}
        topPressurePct={data.summary.top_pressure_pct}
        avgChange={data.avgChange}
      />

      <div>
        <h3 className="mb-3 text-lg font-semibold">
          Biggest Pressures
        </h3>
        <PressureChart data={data.pressures} />
      </div>

      {data.summary.sacrifice_themes.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            What People Are Giving Up
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.summary.sacrifice_themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full bg-gray-200 px-3 py-1 text-sm capitalize dark:bg-gray-700"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
