"use client";

import { useState } from "react";
import type { FixedAnswers, PressureOption } from "@/lib/types";
import { EmojiSelector } from "./EmojiSelector";
import { ScaleSelector } from "./ScaleSelector";

interface FixedQuestionsFormProps {
  onSubmit: (answers: FixedAnswers) => void;
  isSubmitting?: boolean;
}

export function FixedQuestionsForm({
  onSubmit,
  isSubmitting,
}: FixedQuestionsFormProps) {
  const [pressure, setPressure] = useState<PressureOption | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [sacrifice, setSacrifice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!pressure) newErrors.pressure = "Please select an option";
    if (!change) newErrors.change = "Please select how things have changed";
    if (sacrifice.trim().length < 2)
      newErrors.sacrifice = "Please share at least a brief answer";
    if (sacrifice.length > 200)
      newErrors.sacrifice = "Please keep this under 200 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      biggest_pressure: pressure!,
      change_direction: change!,
      sacrifice: sacrifice.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="mb-3 block text-lg font-semibold">
          What&apos;s your biggest financial pressure right now?
        </label>
        <EmojiSelector value={pressure} onChange={setPressure} />
        {errors.pressure && (
          <p className="mt-2 text-sm text-red-600">{errors.pressure}</p>
        )}
      </div>

      <div>
        <label className="mb-3 block text-lg font-semibold">
          Compared to a year ago, how are things?
        </label>
        <ScaleSelector value={change} onChange={setChange} />
        {errors.change && (
          <p className="mt-2 text-sm text-red-600">{errors.change}</p>
        )}
      </div>

      <div>
        <label className="mb-3 block text-lg font-semibold">
          What&apos;s the one thing you&apos;ve had to cut back on or give up?
        </label>
        <textarea
          value={sacrifice}
          onChange={(e) => setSacrifice(e.target.value)}
          placeholder='e.g. "Heating", "Seeing friends", "Fresh fruit"'
          maxLength={200}
          rows={2}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:focus:border-blue-400"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          {errors.sacrifice ? (
            <span className="text-red-600">{errors.sacrifice}</span>
          ) : (
            <span />
          )}
          <span>{sacrifice.length}/200</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </button>
    </form>
  );
}
