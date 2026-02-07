"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pages } from "@/config/client";
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
        <div className="h-10 rounded-xl bg-border" />
        <div className="h-72 rounded-xl bg-border" />
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-accent/30 p-8 text-center text-muted">
        <p className="text-lg font-medium">{pages.statistics.emptyHeading}</p>
        <p className="mt-1 text-sm">
          {pages.statistics.emptyBody}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StatsBar
        total={data.total}
        topPressure={data.summary.top_pressure}
        topPressurePct={data.summary.top_pressure_pct}
        avgChange={data.avgChange}
      />

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">
          {pages.statistics.pressuresHeading}
        </h3>
        <PressureChart data={data.pressures} />
      </div>

      {data.summary.sacrifice_themes.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-lg font-semibold">
            {pages.statistics.themesHeading}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.summary.sacrifice_themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm capitalize transition-colors hover:border-accent hover:bg-accent-subtle"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
