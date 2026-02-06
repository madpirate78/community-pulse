"use client";

import { CHANGE_LABELS } from "@/lib/types";

interface ScaleSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function ScaleSelector({ value, onChange }: ScaleSelectorProps) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 rounded-lg border-2 px-2 py-3 text-center text-xs font-medium transition-all sm:text-sm ${
            value === n
              ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
          }`}
        >
          {CHANGE_LABELS[n]}
        </button>
      ))}
    </div>
  );
}
