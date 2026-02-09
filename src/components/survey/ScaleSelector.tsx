"use client";

interface ScaleSelectorProps {
  min: number;
  max: number;
  labels: Record<number, string>;
  value: number | null;
  onChange: (value: number) => void;
}

export function ScaleSelector({ min, max, labels, value, onChange }: ScaleSelectorProps) {
  const range: number[] = [];
  for (let n = min; n <= max; n++) range.push(n);

  return (
    <div>
      <div className="flex gap-2">
        {range.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg border-2 px-2 py-3 text-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              value === n
                ? "border-accent bg-accent-subtle text-foreground shadow-soft"
                : "border-border hover:border-border-strong"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{labels[min] ?? String(min)}</span>
        <span>{labels[max] ?? String(max)}</span>
      </div>
    </div>
  );
}
