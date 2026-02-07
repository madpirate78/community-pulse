"use client";

import { useState } from "react";
import { questions } from "@/config/client";
import type { FixedQuestion } from "@/config/schema";
import { ChoiceSelector } from "./ChoiceSelector";
import { ScaleSelector } from "./ScaleSelector";

interface FixedQuestionsFormProps {
  onSubmit: (answers: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown> | null;
}

export function FixedQuestionsForm({
  onSubmit,
  defaultValues,
}: FixedQuestionsFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(defaultValues ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setValue(fieldName: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    for (const q of questions.fixed) {
      const val = values[q.fieldName];
      switch (q.type) {
        case "choice":
          if (!val) newErrors[q.fieldName] = "Please select an option";
          break;
        case "scale":
          if (val == null) newErrors[q.fieldName] = "Please select a value";
          break;
        case "text": {
          const str = (typeof val === "string" ? val : "").trim();
          if (str.length < q.minLength)
            newErrors[q.fieldName] = "Please share at least a brief answer";
          if (str.length > q.maxLength)
            newErrors[q.fieldName] = `Please keep this under ${q.maxLength} characters`;
          break;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trim text values before submitting
    const cleaned: Record<string, unknown> = {};
    for (const q of questions.fixed) {
      if (q.type === "text") {
        cleaned[q.fieldName] = (values[q.fieldName] as string).trim();
      } else {
        cleaned[q.fieldName] = values[q.fieldName];
      }
    }

    onSubmit(cleaned);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {questions.fixed.map((q) => (
        <QuestionField
          key={q.fieldName}
          question={q}
          value={values[q.fieldName] ?? null}
          onChange={(v) => setValue(q.fieldName, v)}
          error={errors[q.fieldName]}
        />
      ))}

      <button
        type="submit"
        className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-soft-lg active:scale-[0.98] disabled:opacity-50"
      >
        Continue
      </button>
    </form>
  );
}

function QuestionField({
  question,
  value,
  onChange,
  error,
}: {
  question: FixedQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-3 block font-display text-lg font-semibold">
        {question.label}
      </label>

      {question.type === "choice" && (
        <ChoiceSelector
          options={question.options}
          value={(value as string) ?? null}
          onChange={onChange}
        />
      )}

      {question.type === "scale" && (
        <ScaleSelector
          min={question.min}
          max={question.max}
          labels={Object.fromEntries(
            Object.entries(question.labels).map(([k, v]) => [Number(k), v])
          )}
          value={(value as number) ?? null}
          onChange={(n) => onChange(n)}
        />
      )}

      {question.type === "text" && (
        <>
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            rows={2}
            className="w-full rounded-lg border-2 border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-accent focus:outline-none"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            {error ? (
              <span className="text-red-700/80">{error}</span>
            ) : (
              <span />
            )}
            <span>
              {((value as string) ?? "").length}/{question.maxLength}
            </span>
          </div>
        </>
      )}

      {error && question.type !== "text" && (
        <p className="mt-2 text-sm text-red-700/80">{error}</p>
      )}
    </div>
  );
}
