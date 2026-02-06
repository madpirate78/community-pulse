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
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6b7280",
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
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            formatter={(value) => [`${value} responses`, "Count"]}
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
