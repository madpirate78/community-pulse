"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PressureData {
  key: string;
  label: string;
  count: number;
  pct: number;
}

// Match particle field category colors for visual consistency
const CATEGORY_COLORS: Record<string, string> = {
  housing:    "#E11D48",  // rose-600
  food:       "#D97706",  // amber-600
  energy:     "#EA580C",  // orange-600
  transport:  "#0D9488",  // teal-600
  childcare:  "#7C3AED",  // violet-600
  healthcare: "#0891B2",  // cyan-600
  debt:       "#DC2626",  // red-600
  other:      "#78716C",  // stone-500
};

const FALLBACK_COLORS = [
  "#E11D48", "#D97706", "#EA580C", "#0D9488",
  "#7C3AED", "#0891B2", "#DC2626", "#78716C",
];

function getBarColor(key: string, index: number): string {
  return CATEGORY_COLORS[key] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function PressureChart({ data }: { data: PressureData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tick={{ fontSize: 13, fill: "var(--text-muted)" }}
          />
          <Tooltip
            formatter={(value) => [`${value} responses`, "Count"]}
            contentStyle={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.key, i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
