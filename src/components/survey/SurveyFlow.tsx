"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { AdaptiveQuestions } from "@/lib/types";
import { FixedQuestionsForm } from "./FixedQuestionsForm";
import { ShimmerLoader } from "./ShimmerLoader";
import { AdaptiveForm } from "./AdaptiveForm";
import { submitResponse } from "@/app/submit/actions";

type Stage = "fixed" | "loading" | "adaptive" | "submitting" | "done";

const stageMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

export function SurveyFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("fixed");
  const [fixedAnswers, setFixedAnswers] = useState<Record<string, unknown> | null>(null);
  const [adaptiveQuestions, setAdaptiveQuestions] =
    useState<AdaptiveQuestions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleFixedSubmit(answers: Record<string, unknown>) {
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
    fixed: Record<string, unknown>,
    adaptive: Record<string, unknown>[] | null
  ) {
    setIsSubmitting(true);
    setSubmitError(null);
    setStage("submitting");
    const result = await submitResponse(fixed, adaptive);
    if (result.success) {
      setStage("done");
      router.push("/thank-you");
    } else {
      const errorObj = result.error as Record<string, string[]> | undefined;
      const message = errorObj?.moderation?.[0] ?? null;
      setSubmitError(message);
      setIsSubmitting(false);
      setStage("fixed");
    }
  }

  return (
    <AnimatePresence mode="wait">
      {(stage === "loading" || stage === "submitting") && (
        <motion.div key="loader" {...stageMotion}>
          <ShimmerLoader />
        </motion.div>
      )}

      {stage === "adaptive" && adaptiveQuestions && (
        <motion.div key="adaptive" {...stageMotion}>
          <AdaptiveForm
            questions={adaptiveQuestions}
            onSubmit={handleAdaptiveSubmit}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      )}

      {stage === "fixed" && (
        <motion.div key="fixed" {...stageMotion}>
          {submitError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {submitError}
            </div>
          )}
          <FixedQuestionsForm
            onSubmit={handleFixedSubmit}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
