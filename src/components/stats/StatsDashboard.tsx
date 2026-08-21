"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pages } from "@/config/client";
import type { StatisticsResponse } from "@/lib/types";
import { PressureChart } from "./PressureChart";
import { StatsBar } from "./StatsBar";
import { EmptyState } from "@/components/ui/EmptyState";

export function StatsDashboard() {
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/statistics")
      .then((res) => {
        if (!res.ok) throw new Error(`Statistics request failed (${res.status})`);
        return res.json();
      })
      .then((d: StatisticsResponse) => setData(d))
      .catch(() => setFailed(true))
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

  if (failed) {
    return (
      <EmptyState
        heading={pages.statistics.errorHeading}
        body={pages.statistics.errorBody}
      />
    );
  }

  if (!data || data.total === 0) {
    return (
      <EmptyState
        heading={pages.statistics.emptyHeading}
        body={pages.statistics.emptyBody}
      />
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
        topPressure={data.topPressure}
        topPressurePct={data.topPressurePct}
        avgChange={data.avgChange}
      />

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold">
          {pages.statistics.pressuresHeading}
        </h3>
        <PressureChart data={data.pressures} />
      </div>

      {data.sacrificeThemes.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-lg font-semibold">
            {pages.statistics.themesHeading}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.sacrificeThemes.map((theme) => (
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
