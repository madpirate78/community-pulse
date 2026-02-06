"use client";

import { useState } from "react";
import type { AdaptiveQuestions } from "@/lib/types";

interface AdaptiveFormProps {
  questions: AdaptiveQuestions;
  onSubmit: (answers: Record<string, unknown>[]) => void;
  isSubmitting?: boolean;
}

export function AdaptiveForm({
  questions,
  onSubmit,
  isSubmitting,
}: AdaptiveFormProps) {
  const [answers, setAnswers] = useState<Record<number, unknown>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = questions.questions.map((q, i) => ({
      question: q.question_text,
      answer: answers[i] ?? null,
      input_type: q.input_type,
    }));
    onSubmit(result);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm text-muted">
        Based on what you shared, we have a couple more questions:
      </p>

      {questions.questions.map((q, i) => (
        <div key={i}>
          <label className="mb-3 block font-display text-lg font-semibold">
            {q.question_text}
          </label>

          {q.input_type === "single_choice" && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [i]: opt }))
                  }
                  className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                    answers[i] === opt
                      ? "border-accent bg-accent-subtle text-foreground shadow-warm"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.input_type === "scale" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [i]: n }))
                  }
                  className={`flex-1 rounded-lg border-2 px-2 py-3 text-center text-sm transition-all ${
                    answers[i] === n
                      ? "border-accent bg-accent-subtle text-foreground shadow-warm"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  {n}
                </button>
              ))}
              <div className="mt-1 flex w-full justify-between text-xs text-muted">
                <span>{q.scale_min_label ?? "1"}</span>
                <span>{q.scale_max_label ?? "5"}</span>
              </div>
            </div>
          )}

          {q.input_type === "short_text" && (
            <input
              type="text"
              maxLength={100}
              value={(answers[i] as string) ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
              }
              className="w-full rounded-lg border-2 border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
              placeholder="Your answer..."
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-warm-lg active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Your Voice"}
      </button>
    </form>
  );
}
