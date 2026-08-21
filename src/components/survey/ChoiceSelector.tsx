"use client";

interface ChoiceOption {
  value: string;
  label: string;
}

interface ChoiceSelectorProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** "grid" (default) for compact fixed questions, "list" for full-width rows. */
  layout?: "grid" | "list";
}

export function ChoiceSelector({
  options,
  value,
  onChange,
  layout = "grid",
}: ChoiceSelectorProps) {
  return (
    <div
      className={
        layout === "list" ? "space-y-2" : "grid grid-cols-2 gap-3 sm:grid-cols-4"
      }
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            layout === "list" ? "w-full" : ""
          } ${
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
