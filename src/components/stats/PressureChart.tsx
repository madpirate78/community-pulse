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

const COLORS = [
  "#B45309",  // amber
  "#9A3412",  // terracotta
  "#65A30D",  // sage
  "#0D9488",  // teal
  "#7C3AED",  // violet
  "#B91C1C",  // clay red
  "#CA8A04",  // gold
  "#6B7280",  // stone gray
];

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
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
