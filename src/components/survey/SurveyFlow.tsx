"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FixedAnswers, AdaptiveQuestions } from "@/lib/types";
import { FixedQuestionsForm } from "./FixedQuestionsForm";
import { ShimmerLoader } from "./ShimmerLoader";
import { AdaptiveForm } from "./AdaptiveForm";
import { submitResponse } from "@/app/submit/actions";

type Stage = "fixed" | "loading" | "adaptive" | "submitting" | "done";

export function SurveyFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("fixed");
  const [fixedAnswers, setFixedAnswers] = useState<FixedAnswers | null>(null);
  const [adaptiveQuestions, setAdaptiveQuestions] =
    useState<AdaptiveQuestions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFixedSubmit(answers: FixedAnswers) {
    setFixedAnswers(answers);
    setStage("loading");

    try {
      const res = await fetch("/api/adaptive-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions?.length > 0) {
          setAdaptiveQuestions(data);
          setStage("adaptive");
          return;
        }
      }
    } catch {
      // If adaptive questions fail, just submit without them
    }

    await doSubmit(answers, null);
  }

  async function handleAdaptiveSubmit(
    adaptiveAnswers: Record<string, unknown>[]
  ) {
    await doSubmit(fixedAnswers!, adaptiveAnswers);
  }

  async function doSubmit(
    fixed: FixedAnswers,
    adaptive: Record<string, unknown>[] | null
  ) {
    setIsSubmitting(true);
    setStage("submitting");
    const result = await submitResponse(fixed, adaptive);
    if (result.success) {
      setStage("done");
      router.push("/thank-you");
    } else {
      setIsSubmitting(false);
      setStage("fixed");
    }
  }

  if (stage === "loading" || stage === "submitting") {
    return <ShimmerLoader />;
  }

  if (stage === "adaptive" && adaptiveQuestions) {
    return (
      <AdaptiveForm
        questions={adaptiveQuestions}
        onSubmit={handleAdaptiveSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <FixedQuestionsForm
      onSubmit={handleFixedSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
