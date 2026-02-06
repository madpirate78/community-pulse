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
              ? "border-accent bg-accent-subtle text-foreground shadow-warm"
              : "border-border hover:border-border-strong"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
