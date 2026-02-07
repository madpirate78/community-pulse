"use client";

interface ChoiceOption {
  value: string;
  label: string;
}

interface ChoiceSelectorProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
}

export function ChoiceSelector({ options, value, onChange }: ChoiceSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
            value === opt.value
              ? "border-accent bg-accent-subtle text-foreground shadow-soft"
              : "border-border hover:border-border-strong"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
