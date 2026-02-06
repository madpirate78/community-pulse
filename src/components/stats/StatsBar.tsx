import { PRESSURE_LABELS } from "@/lib/types";

interface StatsBarProps {
  total: number;
  topPressure: string;
  topPressurePct: number;
  avgChange: number;
}

export function StatsBar({
  total,
  topPressure,
  topPressurePct,
  avgChange,
}: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-gray-100 px-5 py-3 text-sm dark:bg-gray-800">
      <span className="font-semibold">
        {total} {total === 1 ? "voice" : "voices"}
      </span>
      <span className="text-gray-500 dark:text-gray-400">
        Top concern: {PRESSURE_LABELS[topPressure] ?? topPressure} (
        {topPressurePct}%)
      </span>
      <span className="text-gray-500 dark:text-gray-400">
        Avg change: {avgChange}/5
      </span>
    </div>
  );
}
