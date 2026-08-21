"use client";

import { useState } from "react";
import type { AdaptiveQuestions } from "@/lib/types";
import { ChoiceSelector } from "./ChoiceSelector";
import { ScaleSelector } from "./ScaleSelector";
import { submitButtonClass, textInputClass } from "@/components/ui/form-styles";

interface AdaptiveFormProps {
  questions: AdaptiveQuestions;
  onSubmit: (answers: Record<string, unknown>[]) => void;
}

export function AdaptiveForm({ questions, onSubmit }: AdaptiveFormProps) {
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setAnswer(index: number, value: unknown) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
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

      {questions.questions.map((q, i) => {
        const fieldId = `adaptive-${i}`;
        return (
          <div key={fieldId}>
            <label
              id={`${fieldId}-label`}
              htmlFor={q.input_type === "short_text" ? fieldId : undefined}
              className="mb-3 block font-display text-lg font-semibold"
            >
              {q.question_text}
            </label>

            {q.input_type === "single_choice" && q.options && (
              <div role="group" aria-labelledby={`${fieldId}-label`}>
                <ChoiceSelector
                  layout="list"
                  options={q.options.map((opt) => ({ value: opt, label: opt }))}
                  value={(answers[i] as string) ?? null}
                  onChange={(v) => setAnswer(i, v)}
                />
              </div>
            )}

            {q.input_type === "scale" && (
              <div role="group" aria-labelledby={`${fieldId}-label`}>
                <ScaleSelector
                  min={1}
                  max={5}
                  labels={{
                    1: q.scale_min_label ?? "1",
                    5: q.scale_max_label ?? "5",
                  }}
                  value={(answers[i] as number) ?? null}
                  onChange={(n) => setAnswer(i, n)}
                />
              </div>
            )}

            {q.input_type === "short_text" && (
              <input
                id={fieldId}
                type="text"
                maxLength={100}
                value={(answers[i] as string) ?? ""}
                onChange={(e) => setAnswer(i, e.target.value)}
                className={textInputClass}
                placeholder="Your answer..."
              />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className={submitButtonClass}
      >
        {isSubmitting ? "Submitting\u2026" : "Submit Your Voice"}
      </button>
    </form>
  );
}
