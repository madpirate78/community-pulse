"use client";

import { PRESSURE_LABELS, type PressureOption } from "@/lib/types";

interface EmojiSelectorProps {
  value: PressureOption | null;
  onChange: (value: PressureOption) => void;
}

const OPTIONS = Object.entries(PRESSURE_LABELS) as [PressureOption, string][];

export function EmojiSelector({ value, onChange }: EmojiSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {OPTIONS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
            value === key
              ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
